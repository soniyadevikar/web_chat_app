const asyncHandler = require("express-async-handler");
const Chat = require('../models/chatModel');
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChat = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);

  }

});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findOne({ _id: chatId });

  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  const isAdmin = chat.groupAdmin.equals(req.user._id);

  if (!isAdmin) {
    res.status(401);
    throw new Error("Unauthorized: Only group admin can remove users");
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const chat = await Chat.findOne({ _id: chatId });

  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  const isAdmin = chat.groupAdmin.equals(req.user._id);

  if (!isAdmin) {
    res.status(401);
    throw new Error("Unauthorized: Only group admin can remove users");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

const deleteChat = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const loggedInUserId = req.user._id; // ✅ who is trying to delete

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Rule 1: If it's a Group, Only Admin can delete
  if (chat.isGroupChat) {
    if (chat.groupAdmin.toString() !== loggedInUserId.toString()) {
      res.status(403);
      throw new Error("Only Group Admin can delete the group chat");
    }
  } else {
    // Rule 2: If it's a private chat (normal), allow either participant to delete
    if (!chat.users.some(u => u.toString() === loggedInUserId.toString())) {
      res.status(403);
      throw new Error("You are not a part of this chat");
    }
  }

  // Delete messages first
  await Message.deleteMany({ chat: chatId });

  // Then delete chat
  await Chat.deleteOne({ _id: chatId });

  res.json({ message: "Chat and messages deleted successfully" });
});



module.exports = { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup, deleteChat };
