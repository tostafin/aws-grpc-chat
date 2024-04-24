import { useEffect, useState } from 'react';

import { BroadcastClient } from './generated/broadcast_pb_service';

import { Button, ChakraProvider, Flex, Input, Text } from '@chakra-ui/react'
import { Message, User } from './generated/broadcast_pb';

import { v4 as uuidv4 } from 'uuid';
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

const client = new BroadcastClient("https://backend.mnessel.pl");
const userId = uuidv4()

function App() {
  const [comment, setComment] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const onCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)

  const onBroadcastMessage = async () => {
    const message = new Message()
    message.setUserId(userId)
    message.setContent('New message')
    message.setTimestamp(google_protobuf_timestamp_pb.Timestamp.fromDate(new Date()),)
    client.broadcastMessage(message, () => { })
  }

  useEffect(() => {
    const user = new User()
    user.setId(userId)
    const streamer = client.createStream(user)
    streamer.on('status', status => console.log({ status }))
    streamer.on('data', response => setMessages(prevMessages => [...prevMessages, response]))
    streamer.on('end', () => console.log('stream end'))
    return () => streamer.cancel()
  }, [])

  return (
    <ChakraProvider>
      <Flex maxW="40rem" m="0 auto" mt="5rem">
        <Flex w="100%" flexDir="column" gap="1rem">
          <Input value={comment} onChange={onCommentChange} placeholder="Your message..." />
          <Button alignSelf='flex-start' onClick={onBroadcastMessage}>Send message</Button>
          <Text>General chat</Text>
          {messages.map((message, index) => (
            <Flex key={message.getUserId() + index}>
              <Text>{message.getUserId()} posted:{' '}</Text>
              <Text>{message.getContent()}</Text>
              <Text>{message.getTimestamp()?.toDate().toDateString() || ''}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
