import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { userAtom } from './recoil/userAtom'; // userAtom import

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [, setUser] = useRecoilState(userAtom); // 사용자 정보 상태 관리

  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const response = await axios.get('/auth/validate', {
          withCredentials: true,
        });

        if (response.data) {
          console.log(response.data);
          setUser({ userId: response.data.userId, email: response.data.email }); // 사용자 정보 업데이트
          setIsAuthenticated(true);
        } else {
          await refreshAccessToken();
        }
      } catch (error) {
        await refreshAccessToken();
      }
    };

    const refreshAccessToken = async () => {
      try {
        await axios.post('/auth/refresh', null, {
          withCredentials: true,
        });
        await checkAccessToken(); // 액세스 토큰을 갱신한 후 사용자 정보 재확인
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAccessToken();
  }, [setUser]); // setUser를 의존성 배열에 추가

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />; // 인증되지 않은 경우 리다이렉트
  }

  return <Outlet />; // 자식 컴포넌트를 렌더링
};

export default PrivateRoute;
