const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// In-memory storage
const documents = new Map();

const findOrCreateDocument = (id, userEmail) => {
  if (id == null) return;

  if (!documents.has(id)) {
    // Create new document
    documents.set(id, {
      _id: id,
      data: '',
      title: 'Untitled Document',
      owner: userEmail,
      members: [{ email: userEmail, role: 'admin' }], // Roles: admin, editor, viewer
      isPrivate: true,
      linkAccess: 'none' // none, viewer, editor
    });
  }

  return documents.get(id);
};

const checkAccess = (doc, email) => {
  if (!doc.isPrivate) return 'editor'; // Public docs are editable by default (or change logic)

  // Check members
  const member = doc.members.find(m => m.email === email);
  if (member) return member.role;

  // Check link access
  if (doc.linkAccess !== 'none') return doc.linkAccess;

  return null; // No access
};

// API Routes
app.get('/api/documents', (req, res) => {
  const email = req.headers['user-email'];
  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  // Filter docs where user is a member
  const docs = Array.from(documents.values())
    .filter(d => d.members.some(m => m.email === email))
    .map(d => ({ _id: d._id, title: d.title, role: d.members.find(m => m.email === email).role }));

  res.json(docs);
});

app.get('/api/documents/:id', (req, res) => {
  const email = req.headers['user-email'];
  const doc = documents.get(req.params.id);

  if (!doc) {
    const newDoc = findOrCreateDocument(req.params.id, email);
    return res.json(newDoc);
  }

  const role = checkAccess(doc, email);
  if (!role) return res.status(403).json({ message: 'Access Denied' });

  res.json({ ...doc, currentUserRole: role });
});

app.post('/api/documents/:id/invite', (req, res) => {
  const { id } = req.params;
  const { email, targetEmail, role } = req.body; // email = requester

  const doc = documents.get(id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });

  const requesterRole = checkAccess(doc, email);
  if (requesterRole !== 'admin') return res.status(403).json({ message: 'Only admins can invite' });

  // Add or update member
  const existingMemberIndex = doc.members.findIndex(m => m.email === targetEmail);
  if (existingMemberIndex > -1) {
    doc.members[existingMemberIndex].role = role;
  } else {
    doc.members.push({ email: targetEmail, role });
  }

  documents.set(id, doc);
  res.json({ message: 'User invited', members: doc.members });
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const email = req.headers['user-email'];

  const doc = documents.get(id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });

  const requesterRole = checkAccess(doc, email);
  if (requesterRole !== 'admin') return res.status(403).json({ message: 'Only admins can delete documents' });

  documents.delete(id);
  res.status(200).json({ message: 'Document deleted successfully' });
});

// Socket.io Logic
io.on('connection', (socket) => {
  const userEmail = socket.handshake.query.email;

  socket.on('get-document', async (documentId) => {
    let document = documents.get(documentId);

    if (!document) {
      document = findOrCreateDocument(documentId, userEmail);
    }

    const role = checkAccess(document, userEmail);
    if (!role) {
      socket.emit('access-denied');
      return;
    }

    socket.join(documentId);
    socket.emit('load-document', document.data);
    socket.emit('role-update', role);

    // Presence Logic
    const updatePresence = () => {
      const room = io.sockets.adapter.rooms.get(documentId);
      const users = [];
      if (room) {
        room.forEach(socketId => {
          const s = io.sockets.sockets.get(socketId);
          if (s && s.handshake.query.email) {
            users.push(s.handshake.query.email);
          }
        });
      }
      io.to(documentId).emit('active-users', [...new Set(users)]);
    };

    updatePresence();

    socket.on('send-changes', (delta) => {
      const currentRole = checkAccess(documents.get(documentId), userEmail);
      if (currentRole === 'viewer') return;
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      const currentRole = checkAccess(documents.get(documentId), userEmail);
      if (currentRole === 'viewer') return;

      const doc = documents.get(documentId);
      if (doc) {
        doc.data = data;
        documents.set(documentId, doc);
      }
    });

    socket.on('disconnect', () => {
      setTimeout(() => updatePresence(), 1000);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using In-Memory Storage (MongoDB disabled)');
});
