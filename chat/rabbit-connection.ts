import amqplib from "amqplib";

const connectToRabbitMQ = async () => {
  return amqplib.connect({
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASS,
    port: 5672,
    // hostname: "localhost",
    hostname: "rabbitmq",
    vhost: "/",
  });
};
export default connectToRabbitMQ;
// export const connectToRabbitMQ = async () => {
//   return amqplib.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
// };
