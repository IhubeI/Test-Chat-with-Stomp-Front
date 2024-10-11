// src/recoil/userAtom.js
import { atom } from 'recoil';

export const userAtom = atom({
  key: 'userAtom', // 고유한 ID (다른 atom과 겹치지 않도록)
  default: { userId: '', email: '' }, // 기본값을 빈 객체로 설정
});