import React from 'react';
import { Routes, Route } from 'react-router-dom'; // 라우터 컴포넌트 임포트
import LoginPage from './LoginPage'; // 로그인 페이지 경로에 맞게 조정하세요.
import MainPage from './MainPage'; // 메인 페이지 경로에 맞게 조정하세요.
import PrivateRoute from './PrivateRoute';
import NotFoundPage from './NotFoundPage';
import ChatComponent from './ChatComponent';


const App = () => {
  
  return (
    <Routes>
      {/* 기본 경로에 로그인 페이지 */}
      <Route path="/" element={<LoginPage />} />

      {/* PrivateRoute로 중첩 라우팅 설정 */}
      <Route element={<PrivateRoute />}>
        {/* 메인 페이지 경로 */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/test/:receiverId" element={<ChatComponent />} />
      </Route>


      {/* 페이지가 없으면 보여줄 페이지 - 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
