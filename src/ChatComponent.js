import React, { useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom';
import './ChatComponent.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChatComponent = () => {
    const { receiverId } = useParams(); // URL에서 receiverId 가져오기
    const user = useRecoilValue(userAtom); // 사용자 정보 가져오기
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [inputMessage, setInputMessage] = useState(''); // 입력 메시지 상태
    const [chatRoomId, setChatRoomId] = useState(null); // 방번호 상태 추가
    const baseURL = process.env.REACT_APP_BASE_URL;

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
                setChatRoomId(response.data.chatroomId); // 방번호를 상태에 저장
                return response.data; // 존재하면 데이터 반환
            } else {
                console.log('채팅방이 존재하지 않습니다.'); // 존재하지 않을 때 로그 추가
                return null; // 데이터가 없으면 null 반환
            }
        } catch (error) {
            console.error('채팅방 존재 확인 중 오류:', error);
            return null; // 오류 발생 시 null 반환
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
            setChatRoomId(response.data.chatroomId); // 새로 생성된 방번호 저장
            console.log('채팅방이 생성되었습니다.');
        } catch (error) {
            console.error('채팅방 생성 중 오류:', error);
        }
    }, [baseURL, user.userId, receiverId]);

    // 웹소켓 연결
    const connect = useCallback(() => {
        if (!chatRoomId) return; // chatRoomId가 없으면 연결하지 않음

        const client = Stomp.over(() => new SockJS(`${baseURL}/stomp/chat/`));

        client.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            // 방번호를 포함한 구독 경로로 수정
            client.subscribe(`/sub/chat/${chatRoomId}`, (message) => {
                setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
            });
            setStompClient(client); // 연결 성공 후 stompClient 상태 설정
        }, (error) => {
            console.error('Connection error: ', error);
            setTimeout(() => {
                console.log('재연결 시도 중');
                connect();
            }, 5000);
        });
    }, [baseURL, chatRoomId]); // chatRoomId를 의존성으로 추가

    useEffect(() => {
        const initChatRoom = async () => {
            const exists = await checkChatRoomExists();
            if (!exists) {
                console.log('채팅방이 존재하지 않습니다. 새로 생성합니다.');
                await createChatRoom();
            } else {
                console.log('채팅방이 존재합니다.');
            }
        };

        // 채팅방 초기화 및 생성
        initChatRoom();
    }, [checkChatRoomExists, createChatRoom]); // 의존성 추가

    // chatRoomId가 설정되면 connect 호출
    useEffect(() => {
        if (chatRoomId) {
            connect();
        }
    }, [chatRoomId, connect]); // chatRoomId를 의존성으로 추가

    const sendMessage = () => {
        if (stompClient && inputMessage.trim() && chatRoomId) { // chatRoomId가 있는지 확인
            const messageData = {
                message: inputMessage,
                senderId: user.userId,
                receiverId: receiverId,
                chatRoomId: chatRoomId // 방번호 포함
            };
            stompClient.send(`/pub/chat/${chatRoomId}`, {}, JSON.stringify(messageData)); // 방번호 포함하여 메시지 전송
            setInputMessage(''); // 메시지 전송 후 입력 필드 초기화
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage(); // Enter 키를 눌렀을 때 메시지 전송
        }
    };

    return (
        <div className="chat-container">
            <h1>Chat Component</h1>
            <div className="message-container">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.senderId === user.userId ? 'my-message' : 'other-message'}>
                        <div>{msg.message} (from: {msg.senderId})</div>
                        <span className="timestamp">디비에서 찍어야하는 시간값 아닐까요...</span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)} // 입력 필드 값 업데이트
                onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
                placeholder="메시지를 입력하세요..." // 플레이스홀더 텍스트
            />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
};

export default ChatComponent;
