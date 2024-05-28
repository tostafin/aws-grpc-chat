import {Message} from './generated/broadcast_pb';
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

const chatMessages = [
    "This is the best concert I've ever seen!🔥",
    "Who's been a fan of this band for years?",
    "I love this song! 🔥",
    "The band is in top form tonight!",
    "Does anyone know what the next song will be?",
    "Am I the only one who thinks the drummer is amazing?",
    "The sound quality is just perfect!💖",
    "I hope they play my favorite song!",
    "This ballad always makes me emotional.",
    "So glad to be here with all of you!",
    "How long is the concert?",
    "That was a surprise they played this song!",
    "I must see them live someday!",
    "Who else is dancing in their room? 😆",
    "Where can I buy tickets for their shows?",
    "That guitar solo was epic!",
    "Does anyone know when their new album is coming out?",
    "Greetings from Poland! Anyone else from PL?",
    "Who's your favorite band member?",
    "Can't believe how fast time flies!",
    "Is anyone recording this concert?",
    "Those stage lights are amazing!",
    "Does anyone know the name of this new song?",
    "Have fun, everyone! 💖",
    "Is it just me or does the vocalist sound amazing tonight?",
    "Where can I buy the band's merch?",
    "I love the energy of the audience!",
    "Anyone else here for the first time at their concert?",
    "I have chills from this music!",
    "Thanks for the stream! This is fantastic!💖",
    "Does anyone know the setlist for tonight?",
    "Can we watch a recording of this stream later?",
    "I love how the band connects with the audience!",
    "Is anyone else here for the opening act?",
    "How many people are watching live?",
    "This song always brings back memories!",
    "Does anyone know the story behind this song?",
    "Great idea with this stream!🔥",
    "Is anyone here from abroad?",
    "Can't wait for their new album!",
    "I've always dreamed of seeing them live!",
    "What are your plans after the concert?",
    "That drum solo was incredible!",
    "Can someone tell me the name of this song?",
    "This is my first online concert!",
    "Is anyone else having quality issues with the stream?",
    "Does anyone have photos from previous concerts?🔥",
    "I love the moment when the whole crowd sings along!",
    "What's your favorite album?",
    "Thanks for letting me be here with you!",
    "Does anyone know how much longer the concert will last?",
    "This band really knows how to rock the house!",
    "I wonder if they'll play anything new tonight?",
    "What's your favorite encore song?",
    "The stream is working great, thanks to the organizers!",
    "Has anyone heard of their solo projects?",
    "Does anyone know other bands in this style?",
    "That was an amazing performance, bravo!🔥",
    "Has anyone here been to their live concert?",
    "Greetings to all the fans!",
    "I'm just here for this one song!",
    "Who knows all the lyrics by heart?",
    "Great show, I'll come back every time!💖",
    "I'm impressed by their energy on stage!",
    "Does anyone know who's producing this stream?",
    "Who else can't stop dancing?",
    "I love how everyone here is having fun!🔥",
    "I always wait for this moment in the concert!",
    "Does anyone know their tour schedule?",
    "I'm here with my family, we're all enjoying it!",
    "Is anyone else experiencing lag?",
    "Where can I buy their latest album?",
    "What's your favorite live track?",
    "Who's been following them since the beginning?",
    "This is my first time seeing this band!",
    "Can someone recommend similar bands?",
    "I'm thrilled by today's performance!",
    "Does anyone know other platforms for live concerts?",
    "Who else can't wait for the next song?",
    "I love how the band improvises on stage!",
    "Does anyone have a link to the full setlist?",
    "Who's been waiting for this song all night?🔥",
    "Does anyone know when the next concert will be?",
    "I'm here with friends, we're having a blast!",
    "This was the best online concert I've seen!💖",
    "Who else has vinyl records of this band?",
    "Does anyone know the dates of their next shows?",
    "This song always makes me emotional!💖",
    "Who else is here after work?",
    "Does anyone know their official Instagram account?😆",
    "I'm impressed by their performance tonight!",
    "Who else is taking screen captures?",
    "This band always gives their all!",
    "Does anyone know if there will be a replay of the stream?",
    "Who knows all the words to this song?",
    "Can someone post a link to the band's official website?",
    "I love how the lead singer interacts with the audience!🔥",
    "This is my first time here, I highly recommend it! 🔥",
    "Does anyone have info on their next album?",
    "Who else is planning to see them live this year?",
    "I've always dreamed of hearing them live!",
    "Can someone recommend other bands in a similar style?",
    "Who's recording this concert?"
];


export function generateUID() {
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return (firstPart + secondPart).toString();
}

export function generateRandomMessage(chatId) {
    const userId = generateUID();
    const message = new Message();
    const randomIndex = Math.floor(Math.random() * chatMessages.length);
    const randomMessage = chatMessages[randomIndex];

    message.setUserId(userId);
    message.setContent(randomMessage);
    message.setChatId(chatId);
    message.setTimestamp(google_protobuf_timestamp_pb.Timestamp.fromDate(new Date()));

    return message;
}