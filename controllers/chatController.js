const Message = require('../models/Message');
// const { sendMessageToQueue } = require('../utils/rabbitmq');
const { sendNotification } = require('../utils/socket');
const User = require('../models/User');
const mongoose = require('mongoose');


const { sendMessageToQueue, consumeMessages } = require('../utils/rabbitmq'); 
const { getUserSocket } = require('../utils/socket'); 

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;

        // Validate required fields
        if (!sender || !receiver || !message) {
            return res.status(400).json({ message: 'Sender, receiver, and message are required' });
        }

        // Create a new message
        const messageData = { sender, receiver, message };

        const newMessage = new Message(messageData);
        await newMessage.save();

        // Check if the receiver is online
        const receiverUser = await User.findById(receiver);
        if (receiverUser.online) {
            const receiverSocket = getUserSocket(receiver);
            sendNotification(receiver, messageData);
            // sendMessageToQueue('messageQueue', messageData); 

            if (receiverSocket) {
                // Send the message via WebSocket
                receiverSocket.send(JSON.stringify({ type: 'newMessage', data: messageData }));
            }
        } else {
            // Send message to RabbitMQ queue
            sendMessageToQueue('messageQueue', messageData);
        }

        // Return success response
        res.status(201).json({ message: 'Message sent successfully', data: messageData });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};


exports.receiveMessages = async (req, res) => {
    try {
        const receiverId = req.params.receiverId;

        // Fetch messages from the database for the receiver
        const messages = await Message.find({ receiver: receiverId });

        // Return the messages as a response
        res.status(200).json(messages);

         // Consume messages from RabbitMQ queue
         consumeMessages('messageQueue', async (messageData) => {
            if (messageData.receiver === receiverId) {
                const newMessage = new Message(messageData);
                await newMessage.save();
                sendNotification(receiverId, messageData);
            }
        });


    } catch (error) {
        console.error('Error receiving messages:', error);
        res.status(500).json({ message: 'Failed to receive messages', error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const receiverId = req.params._id;
        console.log(receiverId,"receiverId");
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // Fetch messages from the past 10 days
        const recentMessages = await Message.find({
            receiver: receiverId,
            createdAt: { $gte: tenDaysAgo }
        });

        res.status(200).json(recentMessages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
    }
};


exports.deleteOldMessages = async () => {
    try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // Delete messages older than 10 days
        await Message.deleteMany({ createdAt: { $lt: tenDaysAgo } });
        console.log('Old messages deleted successfully');
    } catch (error) {
        console.error('Error deleting old messages:', error);
    }
};



exports.listChats = async (req, res) => {
    try {
        const _id = req.userData._id;
        console.log('_id', _id);
        const userId = req.userData.userId;
        

        if (!_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const userObjectId = new mongoose.Types.ObjectId(_id);

        // Aggregate to find the last message for each conversation involving the user
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId },
                        { receiver: userObjectId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userObjectId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    _id: 0,
                    conversation_id: '$_id',
                    userId:'$userDetails.userId',
                    firstName: '$userDetails.firstName',
                    lastName: '$userDetails.lastName',
                    firstPhoto: { $arrayElemAt: ['$userDetails.photos', 0] },
                    lastMessage: {
                        userId:'$lastMessage.userId',
                        message: '$lastMessage.message',
                        createdAt: '$lastMessage.createdAt'
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.status(200).json({  conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
};





exports.getAllConversations = async (req, res) => {
    try {
        const userId = req.userData._id;

        // Find the most recent message sent or received by the user
        const mostRecentMessage = await Message.findOne({
            $or: [{ sender: userId }, { receiver: userId }],
            lastMessage: true // Add this condition to find the last message
        }).sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .populate('sender receiver', 'firstName lastName email photos');

        console.log(mostRecentMessage,'mostRecentMessage');

        if (!mostRecentMessage) {
            // If no message is found, return an empty array
            return res.status(200).json([]);
        }

        let otherUser;
        if (mostRecentMessage.sender._id.toString() === userId.toString()) {
            // If the user is the sender, get information about the receiver
            otherUser = {
                _id: mostRecentMessage.receiver._id.toString(),
                firstName: mostRecentMessage.receiver.firstName,
                lastName: mostRecentMessage.receiver.lastName,
                email: mostRecentMessage.receiver.email,
                photo: mostRecentMessage.receiver.photos.length > 0 ? mostRecentMessage.receiver.photos[0].filename : null,
                lastMessage: mostRecentMessage.message,
                timestamp: mostRecentMessage.createdAt // Use createdAt instead of timestamp
            };
        } else {
            // If the user is the receiver, get information about the sender
            otherUser = {
                _id: mostRecentMessage.sender._id.toString(),
                firstName: mostRecentMessage.sender.firstName,
                lastName: mostRecentMessage.sender.lastName,
                email: mostRecentMessage.sender.email,
                photo: mostRecentMessage.sender.photos.length > 0 ? mostRecentMessage.sender.photos[0].filename : null,
                lastMessage: mostRecentMessage.message,
                timestamp: mostRecentMessage.createdAt // Use createdAt instead of timestamp
            };
        }

        res.status(200).json([otherUser]);
    } catch (error) {
        console.error('Error listing chat users:', error);
        res.status(500).json({ message: 'Failed to list chat users', error: error.message });
    }
};




// exports.getActiveChats = async (req, res) => {
//     try {
//         // Log all messages to verify data
//         // const allMessages = await Message.find();
//         // console.log('All Messages:', allMessages);

//         // Find all unique users who have either sent or received a chat message
//         const chatUsers = await Message.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     senders: { $addToSet: '$sender' },
//                     receivers: { $addToSet: '$receiver' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     users: { $setUnion: ['$senders', '$receivers'] }
//                 }
//             }
//         ]);

//         // Log the result of chatUsers aggregation
//         console.log('Chat Users:', chatUsers);

//         // Extract user IDs from chat messages
//         const chatUserIds = chatUsers.length > 0 ? chatUsers[0].users : [];

//         // Log the extracted user IDs
//         console.log('Chat User IDs:', chatUserIds);

//         // Find all users who have either sent or received a chat request
//         const requestUsers = await User.aggregate([
//             {
//                 $project: {
//                     sentRequests: 1,
//                     receivedRequests: 1
//                 }
//             },
//             {
//                 $project: {
//                     users: { $setUnion: ['$sentRequests', '$receivedRequests'] }
//                 }
//             }
//         ]);

//         // Log the result of requestUsers aggregation
//         console.log('Request Users:', requestUsers);

//         // Extract user IDs from chat requests
//         const requestUserIds = requestUsers.length > 0 ? requestUsers[0].users : [];

//         // Log the extracted request user IDs
//         console.log('Request User IDs:', requestUserIds);

//         // Combine the user IDs from both sources
//         const allUserIds = [...new Set([...chatUserIds, ...requestUserIds].map(id => mongoose.Types.ObjectId(id)))];

//         // Log the combined user IDs
//         console.log('All User IDs:', allUserIds);

//         // Retrieve user details for these unique user IDs
//         const users = await User.find({ _id: { $in: allUserIds } }).select('username email');

//         // Log the found users
//         console.log('Users:', users);

//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error in getActiveChats:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };




// exports.getActiveChats = async (req, res) => {
//     try {
//         // Find all unique users who have either sent or received a chat message
//         const chatUsers = await Message.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     senders: { $addToSet: '$senderId' },
//                     receivers: { $addToSet: '$receiverId' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     users: { $setUnion: ['$senders', '$receivers'] }
//                 }
//             }
//         ]);

//         console.log(chatUsers,"chatUsers");

//         // Extract user IDs from chat messages
//         const chatUserIds = chatUsers.length > 0 ? chatUsers[0].users : [];

//         // Find all users who have either sent or received a chat request
//         const requestUsers = await User.aggregate([
//             {
//                 $project: {
//                     sentRequests: 1,
//                     receivedRequests: 1
//                 }
//             },
//             {
//                 $project: {
//                     users: { $setUnion: ['$sentRequests', '$receivedRequests'] }
//                 }
//             }
//         ]);

//         // Extract user IDs from chat requests
//         const requestUserIds = requestUsers.length > 0 ? requestUsers[0].users : [];

//         // Combine the user IDs from both sources
//         const allUserIds = [...new Set([...chatUserIds, ...requestUserIds].map(id => mongoose.Types.ObjectId(id)))];

//         // Retrieve user details for these unique user IDs
//         const users = await User.find({ _id: { $in: allUserIds } }).select('username email');

//         res.status(200).json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// };











// exports.sendMessage = async (req, res) => {
//     try {
//         const { sender, receiver, message } = req.body;

//         // Validate required fields
//         if (!sender || !receiver || !message) {
//             return res.status(400).json({ message: 'Sender, receiver, and message are required' });
//         }

//         // Create a new message
//         const newMessage = new Message({
//             sender,
//             receiver,
//             message
//         });

//         // Save the message to the database
//         await newMessage.save();

//         // Return success response
//         res.status(201).json({ message: 'Message sent successfully', data: newMessage });
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ message: 'Failed to send message', error: error.message });
//     }
// };

// exports.receiveMessages = async (req, res) => {
//     try {
//         const receiverId = req.params.receiverId; // Extract receiver ID from request parameters

//         // Fetch messages from the database for the receiver
//         const messages = await Message.find({ receiver: receiverId });

//         // Return the messages as a response
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error('Error receiving messages:', error);
//         res.status(500).json({ message: 'Failed to receive messages', error: error.message });
//     }
// };

// exports.getChatHistory = async (req, res) => {
//     try {
//         const { user } = req.params;
//         const { sender, receiver } = req.query;

//         // Validate required fields
//         if (!sender || !receiver) {
//             return res.status(400).json({ message: 'Sender and receiver are required' });
//         }

//         // Fetch chat history from the database
//         const chatHistory = await Message.find({
//             $or: [
//                 { sender, receiver },
//                 { sender: receiver, receiver: sender }
//             ]
//         }).sort({ createdAt: 1 });

//         // Return chat history
//         res.status(200).json({ chatHistory });
//     } catch (error) {
//         console.error('Error fetching chat history:', error);
//         res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
//     }
// };
