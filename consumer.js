const amqp = require('amqplib/callback_api');
const connectDB = require('./utils/db');
const Message = require('./models/Message');

// Connect to MongoDB
connectDB().then(() => {
    amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
            throw error0;
        }
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }
            const queue = 'messageQueue';
            channel.assertQueue(queue, { durable: false });

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const messageData = JSON.parse(msg.content.toString());
                    const newMessage = new Message(messageData);
                    await newMessage.save();
                    channel.ack(msg);
                }
            });
        });
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
