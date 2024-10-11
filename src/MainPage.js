import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom'; // userAtom import
import axios from 'axios'; // axios for API calls
import './MainPage.css'; // Import the CSS file
import { NavLink } from 'react-router-dom';

const MainPage = () => {
  const user = useRecoilValue(userAtom); // Recoil 상태에서 사용자 정보 가져오기
  const [userList, setUserList] = useState([]); // 사용자 목록 상태 관리

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
  }, []); // 빈 배열을 의존성으로 하여 한 번만 실행

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
              ID: <NavLink to={`/test/${user.userId}`} >{user.userId}</NavLink>
            </li>
          ))}
        </ul>
      ) : (
        <p>사용자가 없습니다.</p>
      )}
    </div>
  );
};

export default MainPage;
