// LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // React Router의 useNavigate 훅을 가져옵니다.
import './LoginPage.css'; // CSS 파일 가져오기

const LoginPage = () => {
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 생성

  const [loginData, setLoginData] = useState({
    userId: '',
    password: '',
  });

  const [formData, setFormData] = useState({
    userId: '',
    userPassword: '',
    userName: '',
    email: '',
  });

  const [message, setMessage] = useState('');
  const [isModalOpen, setModalOpen] = useState(false); // 모달 상태 추가

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/auth/login', loginData, {
        withCredentials: true // 쿠키를 포함하기 위한 옵션
      });
      console.log(response.data);
      setMessage('로그인 성공!');

      // 로그인 성공 시 메인 페이지로 이동
      navigate('/main'); // 메인 페이지 경로로 이동

    } catch (error) {
      console.error(error);
      setMessage('로그인 실패: 사용자 ID 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value }); // 상태 업데이트
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // 상태 업데이트
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post('/user', formData); // URL 수정
      console.log(response.data);
      setMessage('회원가입 성공!');
      setModalOpen(false); // 모달 닫기
    } catch (error) {
      console.error(error);
      setMessage('회원가입 실패: ' + error.response.data);
    }
  };

  // Enter 키를 눌렀을 때 로그인 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin(); // Enter 키가 눌리면 로그인 함수 호출
    }
  };

  return (<>
    <div className="login-container">
      <h1>로그인 페이지</h1>
      <div className="input-group">
        <input
          type="text"
          name="userId"
          placeholder="사용자 ID"
          value={loginData.userId}
          onChange={handleLoginChange}
          onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={loginData.password}
          onChange={handleLoginChange}
          onKeyDown={handleKeyDown} // Enter 키 이벤트 처리
        />
      </div>
      <button onClick={handleLogin}>로그인</button>
      <button onClick={() => setModalOpen(true)}>회원가입</button> {/* 회원가입 버튼 */}

      {message && <p>{message}</p>}

      {isModalOpen && (
        <div className="modal">
          <h2>회원가입</h2>
          <div className="input-group">
            <input
              type="text"
              name="userId"
              placeholder="사용자 ID"
              value={formData.userId}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="userPassword"
              placeholder="비밀번호"
              value={formData.userPassword}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="userName"
              placeholder="사용자 이름"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <button onClick={handleSignUp}>회원가입</button>
          <button onClick={() => setModalOpen(false)}>닫기</button>
        </div>
      )}
    </div>
  </>
  );
};

export default LoginPage;
