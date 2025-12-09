const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    _id: String, // We'll use the document ID from the client or generate one
    data: Object, // Store the rich text content (e.g., Quill Delta)
    title: { type: String, default: 'Untitled Document' }
});

module.exports = mongoose.model('Document', DocumentSchema);
