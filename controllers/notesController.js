const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
	const notes = await Note.find().lean().exec();
	if (!notes?.length) {
		return res.status(400).json({ message: 'No notes found' });
	}
	res.json(notes);
});

// @desc Get one note
// @route GET /notes/:id
// @access Private
const getOneNote = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No note with that id');

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: 'Note not found' });
	} else {
		return res.json(note);
	}
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
	const { userid, title, text } = req.body;

	// Confirm DATABASE_URI
	if (!userid || !title || !text) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const noteObject = {
		title: title,
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

});

// @desc Update a note
// @route PATCH /note/:id
// @access Private
const updateNote = asyncHandler(async (req, res) => {
	const { id: _id } = req.params;

	const note = req.body;

	if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No note with that id');

	const updatedNote = await Note.findByIdAndUpdate(_id, {...note, _id } , {new: true} );

	if (updatedNote) {
		res.json(updatedNote);
	} else {
		res.status(400).json({ message: 'Invalid note data received' })
	}

});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No note with that id');

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: 'Note not found' });
	}

	const result = await note.deleteOne();

	const reply = `Note ${result.title} with ID ${result._id} deleted`;

	res.json(reply);
});

module.exports = {
	getAllNotes,
	getOneNote,
	createNewNote,
	updateNote,
	deleteNote
}