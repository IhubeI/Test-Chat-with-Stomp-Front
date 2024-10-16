import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom'; // userAtom import
import axios from 'axios'; // axios for API calls
import './MainPage.css'; // Import the CSS file
import { NavLink } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const MainPage = () => {
  const baseURL = process.env.REACT_APP_BASE_URL;
  const user = useRecoilValue(userAtom); // Recoil 상태에서 사용자 정보 가져오기
  const [userList, setUserList] = useState([]); // 사용자 목록 상태 관리
  const [userAList, setUserAList] = useState([]);






  // WebSocket 서버에 연결하는 함수
  const connectToServer = useCallback(() => {
    const client = Stomp.over(() => new SockJS(`${baseURL}/stomp/chat`));

    client.connect({}, (frame) => {

      // 사용자 목록 구독
      client.subscribe(`/sub/users`, (message) => {
        const json = JSON.parse(message.body);
        setUserAList(Array.from(json));
      });
    }, (error) => {
      console.error('Connection error: ', error); // 연결 오류 처리
    });

    return client; // client 반환
  }, [baseURL]);

  //useEffect
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/user');
        setUserList(response.data); // 사용자 목록 업데이트
      } catch (error) {
        console.error('사용자 목록을 가져오는 데 실패했습니다:', error);
      }
    };

    fetchUsers(); // 컴포넌트가 마운트될 때 사용자 목록 가져오기
    if (user === null) return;
    const client = connectToServer();
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [user, baseURL]); // 빈 배열을 의존성으로 하여 한 번만 실행



  return (
    <div className="main-container">
      <h1 className="header">여기는 메인페이지다옹</h1>
      {user ? (
        <div className="user-info">
          <p>사용자 ID: {user.userId}</p>
          <p>이메일: {user.email}</p>
        </div>
      ) : (
        <p>사용자 정보가 없습니다.</p>
      )}

      <h2 className="user-list-header">사용자 목록</h2>
      {userList.length > 0 ? (
        <ul className="user-list">
          {userList.map((user) => (
            <li key={user.userId} className="user-item">
              ID: {user.userId}
            </li>
          ))}
        </ul>
      ) : (
        <p>사용자가 없습니다.</p>
      )}
      {/* 사용자 목록 */}
      <h2 className="user-list-header">현재 사용자 목록</h2>
      <ul className="user-list">
        {userAList.map((userNow, index) => (
          <li className="user-item" key={index}>
            {userNow === user.userId ? userNow + " (나)" :
              <NavLink to={`/test/${userNow}`} >
                {userNow}
              </NavLink>
            }
          </li>
        ))}
      </ul>
    </div >
  );
};

export default MainPage;
