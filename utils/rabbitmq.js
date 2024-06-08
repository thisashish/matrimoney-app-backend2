// utils/rabbitmq.js
const amqp = require('amqplib');
require('dotenv').config();

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname:  'localhost',
            port:  5672,
            username:  'guest',
            password:  'guest',
            vhost:  '/'
        });

        
        channel = await connection.createChannel();
        console.log('RabbitMQ connected');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
};

const sendMessageToQueue = async (queueName, message) => {
    if (!channel) {
        console.error('RabbitMQ channel not initialized');
        return;
    }

    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
        console.log(`Message sent to queue ${queueName}`);
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
    }
};

const consumeMessages = async (queueName, onMessage) => {
    if (!channel) {
        console.error('RabbitMQ channel not initialized');
        return;
    }

    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const messageData = JSON.parse(msg.content.toString());
                await onMessage(messageData);
                channel.ack(msg);
            }
        }, {
            noAck: false
        });
        console.log(`Consuming messages from queue ${queueName}`);
    } catch (error) {
        console.error('Error consuming messages from RabbitMQ:', error);
    }
};

module.exports = {
    connectRabbitMQ,
    sendMessageToQueue,
    consumeMessages
};
