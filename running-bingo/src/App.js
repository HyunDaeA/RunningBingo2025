// 러닝 빙고 앱 + Google Drive 인증 연동 (기본 컴포넌트 버전)
import React, { useState } from 'react';

const participants = [
  "강인숙", "김연진", "김정원", "김진도", "단효민", "박미소", "박병일", "신경인",
  "심효정", "유선희", "이민욱", "이윤영", "이혜정", "장명옥", "전세미", "정선민",
  "정지민", "조정희", "최정숙", "최을용", "현대", "홍현진"
];

const missions = [
  "포토제닉 러닝", "모닝런", "3일 연속 러닝", "10K", "40분",
  "월 마일리지 50K", "같이 달리기 2명", "815 광복절런", "빌드업 5K", "+1K",
  "1K T.T", "우중런", "5K", "대회 참가 1", "같이 달리기 3명",
  "런트립 2", "날짜런", "초심자와 달리기", "월 마일리지 100K", "대회 참가 2",
  "630/500 페이스 이하", "새벽런", "런트립 1", "3K T.T", "1시간 이상 러닝"
];

const CLIENT_ID = "11407241794-i93t9ggg79h9hqg3do03m85p8f6lqo86.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const BingoApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [bingoState, setBingoState] = useState({});
  const [selectedMission, setSelectedMission] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleSelectUser = (name) => {
    setSelectedUser(name);
    if (!bingoState[name]) {
      setBingoState(prev => ({ ...prev, [name]: {} }));
    }
  };

  const initGoogleDrive = () => {
    return new Promise((resolve) => {
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          clientId: CLIENT_ID,
          scope: SCOPES
        });
        await window.gapi.auth2.getAuthInstance().signIn();
        resolve();
      });
    });
  };

  const uploadToDrive = async (file, filename) => {
    const metadata = {
      name: filename,
      mimeType: file.type
    };

    const accessToken = window.gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: form
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const filename = `${selectedUser}_${selectedMission}_${new Date().toISOString()}.jpg`;
      await initGoogleDrive();
      await uploadToDrive(file, filename);
      setBingoState(prev => ({
        ...prev,
        [selectedUser]: {
          ...prev[selectedUser],
          [selectedMission]: true
        }
      }));
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>2025 러닝 빙고</h1>

      <div style={{ marginBottom: 16 }}>
        <p style={{ marginBottom: 8 }}>참가자 선택:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {participants.map(name => (
            <button
              key={name}
              onClick={() => handleSelectUser(name)}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}>
              {name}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>{selectedUser} 님의 빙고판</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {missions.map((mission, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedMission(mission)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: bingoState[selectedUser]?.[mission] ? '#c6f6d5' : '#fff',
                  padding: 10,
                  border: '1px solid #ccc',
                  textAlign: 'center',
                  borderRadius: 6,
                  fontSize: 12
                }}>
                {mission}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMission && (
        <div style={{ marginTop: 24 }}>
          <p style={{ marginBottom: 8 }}>미션: {selectedMission} - 인증 사진 업로드</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="인증 미리보기"
              style={{ marginTop: 16, maxWidth: 300, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BingoApp;

