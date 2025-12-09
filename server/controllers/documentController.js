const Document = require('../models/Document');

exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({}, 'title _id');
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        // For simplicity, we might just redirect to a UUID on the frontend, 
        // but here is an endpoint if needed.
        // In this app, we'll likely rely on 'findOrCreate' via socket mostly, 
        // but a REST endpoint is good for the list view.
        const doc = new Document({ _id: req.body.id, data: '' });
        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.findOrCreateDocument = async (id) => {
    if (id == null) return;

    const document = await Document.findById(id);
    if (document) return document;

    return await Document.create({ _id: id, data: '' });
};
