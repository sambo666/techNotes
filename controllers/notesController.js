const mongoose = require('mongoose');
const Note = require('../models/Note');

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = async (req, res) => {
	const notes = await Note.find().lean().exec();
	if (!notes?.length) {
		return res.status(400).json({ message: 'No notes found' });
	}
	res.json(notes);
};

// @desc Get one note
// @route GET /notes/:id
// @access Private
const getOneNote = async (req, res) => {
	const { id } = req.params;

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No note with that id');

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: 'Note not found' });
	} else {
		return res.json(note);
	}
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (req, res) => {
	const { userid, username, title, text } = req.body;

	// Confirm DATABASE_URI
	if (!userid || !title || !text || !username) {
		return res.status(400).json({ message: `All fields are required ${req.body}` });
	}

	// Check for duplicate title
	const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

	if (duplicate) {
		return res.status(400).json({ message: 'Duplicate note title'});
	}

	const noteObject = {
		title: title,
		username: username,
		text: text,
		completed: false,
		user: userid,
	}

	const note = await Note.create(noteObject);

	if (note) {
		res.status(201).json({ message: `New note '${title}' created` })
	} else {
		res.status(400).json({ message: 'Invalid note data received' })
	}

};

// @desc Update a note
// @route PATCH /note/:id
// @access Private
const updateNote = async (req, res) => {

	const { id } = req.params;

	const { user, title, text, completed, username} = req.body;

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No note with that id');

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: 'Note not found '});
	}

	// Check for duplicate title
	const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

	// Allow renaming of the original note
	if (duplicate && duplicate?._id.toString() !== id) {
		return res.status(409).json({ message: 'Duplicate note title' });
	}

	note.user = user;
	note.title = title;
	note.text = text;
	note.completed = completed;
	note.username = username;

	const updatedNote = await note.save();

	if (updatedNote) {
		res.json(updatedNote);
	} else {
		res.status(400).json({ message: 'Invalid note data received' })
	}

};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (req, res) => {
	const { id } = req.params;

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No note with that id');

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: 'Note not found' });
	}

	const result = await note.deleteOne();

	const reply = `Note ${result.title} with ID ${result._id} deleted`;

	res.json(reply);
};

module.exports = {
	getAllNotes,
	getOneNote,
	createNewNote,
	updateNote,
	deleteNote
}