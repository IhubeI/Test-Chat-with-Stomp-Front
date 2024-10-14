import React, { useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom';
import './ChatComponent.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ChatComponent = () => {
    const { receiverId } = useParams(); // URL에서 receiverId 가져오기
    const user = useRecoilValue(userAtom); // 사용자 정보 가져오기
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [inputMessage, setInputMessage] = useState(''); // 입력 메시지 상태
    const [chatRoomId, setChatRoomId] = useState(null); // 방번호 상태 추가
    const [hasFetchedMessages, setHasFetchedMessages] = useState(false); // 메시지 불러오기 상태 추가
    const baseURL = process.env.REACT_APP_BASE_URL;

    const navigate = useNavigate();

    // 시간관련 function 1
    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            const now = new Date();
            return formatDate(now);
        }

        const date = new Date(timestamp);
        return formatDate(date);
    };

    // 시간관련 function 의 옵션-프론트에 보여질 형식 설정
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const amPm = hours < 12 ? '오전' : '오후';
        const formattedHours = hours % 12 || 12;

        return `${year}-${month}-${day} ${amPm} ${String(formattedHours).padStart(2, '0')}:${minutes}:${seconds}`;
    };

    //CallBack
    // 채팅방 존재 여부 확인
    const checkChatRoomExists = useCallback(async () => {
        try {
            const response = await axios.get(`${baseURL}/chat/room`, {
                params: {
                    participant1Id: user.userId,
                    participant2Id: receiverId,
                },
            });

            if (response.data) {
                setChatRoomId(response.data.chatroomId);
                return response.data;
            } else {
                return null;
            }
        } catch (error) {
            console.error('채팅방 존재 확인 중 오류:', error);
            return null;
        }
    }, [baseURL, user.userId, receiverId]);

    // 새로운 채팅방 생성
    const createChatRoom = useCallback(async () => {
        try {
            const chatRoomDto = {
                participant1Id: user.userId,
                participant2Id: receiverId,
            };
            const response = await axios.post(`${baseURL}/chat/room`, chatRoomDto);
            setChatRoomId(response.data.chatroomId);
        } catch (error) {
            navigate("/main");
            console.error('채팅방 생성 중 오류:', error);
        }
    }, [baseURL, user.userId, receiverId]);

    // 웹소켓 연결
    const connect = useCallback(() => {
        if (!chatRoomId) return;

        const client = Stomp.over(() => new SockJS(`${baseURL}/stomp/chat/`));

        client.connect({}, (frame) => {
            client.subscribe(`/sub/chat/${chatRoomId}`, (message) => {
                setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
            });
            setStompClient(client);
        }, (error) => {
            console.error('Connection error: ', error);
            setTimeout(() => {
                console.log('재연결 시도 중');
                connect();
            }, 5000);
        });
    }, [baseURL, chatRoomId]);

    // 메시지 내역 불러오기 함수
    const fetchMessages = useCallback(async () => {
        if (!chatRoomId || hasFetchedMessages) return;
        try {
            const response = await axios.get(`${baseURL}/chat/messages`, {
                params: { chatRoomId: chatRoomId },
            });
            setMessages(response.data);
            setHasFetchedMessages(true);
        } catch (error) {
            console.error('메시지 불러오기 중 오류:', error);
        }
    }, [baseURL, chatRoomId, hasFetchedMessages]);


    // 메세지 전송
    const sendMessage = () => {
        if (stompClient && inputMessage.trim() && chatRoomId) {
            const messageData = {
                message: inputMessage,
                senderId: user.userId,
                receiverId: receiverId,
                chatRoomId: chatRoomId
            };
            stompClient.send(`/pub/chat/${chatRoomId}`, {}, JSON.stringify(messageData));
            setInputMessage('');
        }
    };

    //엔터키 관련
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    //Effect
    useEffect(() => {
        const initChatRoom = async () => {

            const exists = await checkChatRoomExists();
            if (!exists) {
                // 채팅방이 존재하지 않을 경우 생성
                await createChatRoom();
            } else {
                //존재하면 아무것도 안함
            }

            // 이제 채팅방 ID가 설정되면 메시지를 불러오고 연결
            if (chatRoomId) {
                fetchMessages();
                connect();
            }
        };

        initChatRoom();

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };

    }, [checkChatRoomExists, createChatRoom, chatRoomId, connect]);

    return (
        <div className="chat-container">
            <h1>{receiverId}(와)과의 채팅...</h1>
            <div className="connection">
                {user.userId}님 환영합니다!
            </div> {/* 연결 상태 표시 */}
            <div className="message-container">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.senderId === user.userId ? 'my-message' : 'other-message'}>
                        <div>{msg.message} (from: {msg.senderId})</div>
                        <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    className="message-input" // 사용자 정의 클래스
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요..."
                />
                <div className="custom-button" onClick={sendMessage}>Send Message</div> {/* 사용자 정의 버튼 */}
            </div>
        </div>
    );
};

export default ChatComponent;
