import {useEffect, useState} from 'react';
import {BroadcastClient} from './generated/broadcast_pb_service';
import {
    Avatar,
    Button,
    ChakraProvider,
    Divider,
    Flex,
    Input,
    Progress,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text
} from '@chakra-ui/react';
import {Message, User} from './generated/broadcast_pb';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import {generateRandomMessage, generateUID} from './chatMessages';

const client = new BroadcastClient('https://mnessel.pl');
const userId = generateUID();

function App() {
    const [comment, setComment] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [progress, setProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [numMessages, setNumMessages] = useState(10000);
    const [batchSize, setBatchSize] = useState(100);
    const [ytId, setYtId] = useState<string>("");

    const onCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value);

    const onBroadcastMessage = async () => {
        const message = new Message();
        message.setUserId(userId);
        message.setContent(comment);
        message.setTimestamp(google_protobuf_timestamp_pb.Timestamp.fromDate(new Date()));
        message.setChatId(ytId);
        client.broadcastMessage(message, () => {
        });
    };

    const onMultipleBroadcastMessage = async () => {
        setIsSending(true);
        setProgress(0);
        const totalMessages = numMessages;
        for (let i = 0; i < totalMessages; i += batchSize) {
            const batch = Array.from({length: batchSize}, (_, index) => i + index).filter(index => index < totalMessages);
            await Promise.all(
                batch.map(() => {
                    let message = generateRandomMessage();
                    message.setChatId(ytId);
                    return new Promise<void>((resolve) => {
                        client.broadcastMessage(message, () => {
                            setProgress(prevProgress => prevProgress + 1);
                            resolve();
                        });
                    });
                })
            );
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        setIsSending(false);
    };

    useEffect(() => {
        const user = new User();
        user.setId(userId);
        const chatId = new URLSearchParams(window.location.search).get('ytid') || 'default';
        user.setChatId(chatId);
        const createAndListenStream = () => {
            const streamer = client.createStream(user);
            streamer.on('status', status => setMessages([]));
            streamer.on('data', response => setMessages(prevMessages => [response, ...prevMessages].slice(0, 100)));
            streamer.on('end', () => {
                setTimeout(createAndListenStream, 1000);
            });
            return streamer;
        };

        const streamer = createAndListenStream();

        return () => {
            streamer.cancel();
        };
    }, [ytId]);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ytid = urlParams.get('ytid');
        if (ytid) {
            setYtId(ytid);
        }
    }, []);

    const onNumMessagesChange = (value: number) => {
        setNumMessages(value);
    };
    const onBatchSizeChange = (value: number) => {
        setBatchSize(value);
    };

    return (
        <ChakraProvider>
            <Flex maxW="40rem" m="0 auto" mt="5rem">
                <Flex w="100%" flexDir="column" gap="1rem">
                    <Text fontSize="xl" style={{marginTop: "10px"}} fontWeight="bold" >Message Generator</Text>
                    <Flex align="center" justify="space-between">
                        <Slider
                            aria-label="Number of messages"
                            defaultValue={numMessages}
                            min={100}
                            max={100000}
                            step={100}
                            onChange={onNumMessagesChange}
                            w="75%"
                        >
                            <SliderTrack>
                                <SliderFilledTrack/>
                            </SliderTrack>
                            <SliderThumb/>
                        </Slider>
                        <Text>{numMessages} messages</Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                        <Slider
                            aria-label="Batch size"
                            defaultValue={batchSize}
                            min={100}
                            max={5000}
                            step={100}
                            onChange={onBatchSizeChange}
                            w="75%"
                        >
                            <SliderTrack>
                                <SliderFilledTrack/>
                            </SliderTrack>
                            <SliderThumb/>
                        </Slider>
                        <Text>{batchSize} per batch</Text>
                    </Flex>
                    {isSending && <Progress value={(progress / numMessages) * 100} size="sm" colorScheme="green"/>}

                    <Button alignSelf="flex-start" onClick={onMultipleBroadcastMessage} isDisabled={isSending}>
                        Generate
                    </Button>

                    <Divider my="0.5rem"/>
                    {!!ytId && (
                        <iframe
                            width="100%"
                            height="360"
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`}
                            allowFullScreen
                        />
                    )}
                    <Flex align="center">
                        <Avatar size="sm" name={userId}/>
                        <Text fontWeight="bold" ml="0.5rem">
                            {userId}
                        </Text>
                    </Flex>
                    <Input value={comment} onChange={onCommentChange} placeholder="Your message..."/>
                    <Button alignSelf="flex-start" onClick={onBroadcastMessage} isDisabled={isSending}>
                        Send message
                    </Button>

                    <Text fontSize="xl" style={{marginTop: "10px", margin: "0 auto"}} fontWeight="bold" >General chat</Text>
                    {messages.map((message, index) => (
                        <Flex key={message.getUserId() + index} flexDir="column" w="100%">
                            <Flex align="center">
                                <Avatar size="sm" name={message.getUserId()}/>
                                <Text fontWeight="bold" ml="0.5rem">
                                    {message.getUserId()}
                                </Text>
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                                {message.getTimestamp()?.toDate().toLocaleString() || ''}
                            </Text>
                            <Text>{message.getContent()}</Text>
                            {index < messages.length - 1 && <Divider my="0.5rem"/>}
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </ChakraProvider>
    );
}

export default App;
