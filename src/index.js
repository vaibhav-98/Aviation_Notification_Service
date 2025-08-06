const express = require('express');
const amqplib = require('amqplib')
const { EmailService } = require('./services')


async function connectQueue() {
    try {
        const connection = await amqplib.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue("noti-queue");
        channel.consume("noti-queue", async (data) => {
            console.log(`${Buffer.from(data.content)}`);
            const object = JSON.parse(`${Buffer.from(data.content)}`);
            // const object = JSON.parse(Buffer.from(data).toString());
            await EmailService.sendMail("airlinenoti@gmail.com", object.recepientEmail, object.subject, object.text);
            channel.ack(data);
        })
    } catch(error) {
        console.log(error);
        
    }
}


const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config')

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
     await connectQueue()
   //   try {
   //      const response = await mailsender.sendMail({
   //          from: ServerConfig.Gmail_Email,
   //          to: "vaibhav.tripathi@pw.live",
   //          subject: 'Is the service working ?',
   //          text: 'Yes working ✅'
   //        });

   //  console.log(response);
   //   } catch (error) {
   //      console.log(error);
        
   //   }
    
});
