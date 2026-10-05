import { useState } from "react";
import "./App.css";

const initialCafes = [
  {
    id: 1,
    name: "카페 온도",
    distance: "150m",
    congestion: "여유",
    reliability: "높음",
    outlets: true,
    wifi: true,
    noise: "낮음",
    seats: "넉넉함",
    groupSeats: false,
    open: true,
  },
  {
    id: 2,
    name: "커피하우스 101",
    distance: "280m",
    congestion: "보통",
    reliability: "보통",
    outlets: true,
    wifi: true,
    noise: "보통",
    seats: "보통",
    groupSeats: true,
    open: true,
  },
  {
    id: 3,
    name: "브릭커피",
    distance: "420m",
    congestion: "혼잡",
    reliability: "높음",
    outlets: false,
    wifi: true,
    noise: "높음",
    seats: "부족",
    groupSeats: true,
    open: true,
  },
  {
    id: 4,
    name: "라운지 카페",
    distance: "530m",
    congestion: "정보 부족",
    reliability: "낮음",
    outlets: true,
    wifi: true,
    noise: "보통",
    seats: "보통",
    groupSeats: false,
    open: true,
  },
];

const purposes = [
  {
    id: "study",
    title: "공부",
    description: "집중해서 공부하기 좋은 공간",
    icon: "📚",
    conditions: ["콘센트", "Wi-Fi", "낮은 소음"],
  },
  {
    id: "work",
    title: "업무",
    description: "노트북 작업과 업무에 적합한 공간",
    icon: "💻",
    conditions: ["콘센트", "Wi-Fi", "좌석 여유"],
  },
  {
    id: "talk",
    title: "대화",
    description: "친구와 편하게 이야기하기 좋은 공간",
    icon: "💬",
    conditions: ["그룹 좌석", "적당한 소음", "좌석 여유"],
  },
  {
    id: "rest",
    title: "휴식",
    description: "편안하게 쉬기 좋은 공간",
    icon: "☕",
    conditions: ["좌석 여유", "여유로운 혼잡도", "가까운 거리"],
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [cafes, setCafes] = useState(initialCafes);

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [recommendedCafes, setRecommendedCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useState("");

  // UI 피드백용 State (토스트 & 모달)
  const [toastMessage, setToastMessage] = useState("");
  const [isQrScanning, setIsQrScanning] = useState(false);

  const [reportData, setReportData] = useState({
    congestion: "",
    seats: "",
    noise: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const selectedPurposeData = purposes.find(
    (purpose) => purpose.id === selectedPurpose
  );

  const getScore = (cafe) => {
    let score = 0;

    if (selectedPurpose === "study") {
      if (cafe.outlets) score += 3;
      if (cafe.wifi) score += 2;
      if (cafe.noise === "낮음") score += 3;
      if (cafe.congestion === "여유") score += 2;
    }

    if (selectedPurpose === "work") {
      if (cafe.outlets) score += 3;
      if (cafe.wifi) score += 3;
      if (cafe.seats === "넉넉함") score += 2;
      if (cafe.congestion === "여유") score += 2;
    }

    if (selectedPurpose === "talk") {
      if (cafe.groupSeats) score += 3;
      if (cafe.noise === "보통") score += 2;
      if (cafe.seats !== "부족") score += 2;
      if (cafe.congestion !== "혼잡") score += 1;
    }

    if (selectedPurpose === "rest") {
      if (cafe.seats !== "부족") score += 3;
      if (cafe.congestion === "여유") score += 3;
      if (cafe.distance === "150m") score += 2;
      if (cafe.noise !== "높음") score += 2;
    }

    selectedConditions.forEach((condition) => {
      if (condition === "콘센트" && cafe.outlets) score += 2;
      if (condition === "Wi-Fi" && cafe.wifi) score += 2;
      if (condition === "낮은 소음" && cafe.noise === "낮음") score += 2;
      if (condition === "그룹 좌석" && cafe.groupSeats) score += 2;
      if (condition === "적당한 소음" && cafe.noise === "보통") score += 2;
      if (condition === "좌석 여유" && cafe.seats !== "부족") score += 2;

      if (condition === "여유로운 혼잡도" && cafe.congestion === "여유") {
        score += 2;
      }

      if (condition === "가까운 거리" && cafe.distance === "150m") {
        score += 2;
      }
    });

    return score;
  };

  const selectPurpose = (purposeId) => {
    setSelectedPurpose(purposeId);
    setSelectedConditions([]);
    setPage("conditions");
  };

  const toggleCondition = (condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((item) => item !== condition)
        : [...prev, condition]
    );
  };

  const makeRecommendation = () => {
    const sorted = [...cafes]
      .map((cafe) => ({
        ...cafe,
        score: getScore(cafe),
      }))
      .sort((a, b) => b.score - a.score);

    setRecommendedCafes(sorted);
    setPage("recommend");
  };

  const toggleFavorite = (cafeId) => {
    if (!isLoggedIn) {
      showToast("즐겨찾기는 로그인 후 이용할 수 있어요.");
      setPage("login");
      return;
    }

    setFavorites((prev) =>
      prev.includes(cafeId)
        ? prev.filter((id) => id !== cafeId)
        : [...prev, cafeId]
    );
  };

  const toggleCompare = (cafeId) => {
    setCompareList((prev) => {
      if (prev.includes(cafeId)) {
        return prev.filter((id) => id !== cafeId);
      }

      if (prev.length >= 3) {
        showToast("카페는 최대 3개까지 비교할 수 있어요.");
        return prev;
      }

      return [...prev, cafeId];
    });
  };

  const openCafe = (cafe) => {
    setSelectedCafe(cafe);
    setPage("detail");
  };

  const goHome = () => {
    setPage("home");
    setSelectedCafe(null);
  };

  // 2번 피드백: QR 스캔 모의 모달 핸들러
  const startQrReport = () => {
    setIsQrScanning(true);
    setTimeout(() => {
      setIsQrScanning(false);
      setPage("report");
    }, 1500);
  };

  return (
    <div className="app">
      {/* 토스트 메세지 UI */}
      {toastMessage && <div className="customToast">{toastMessage}</div>}

      {/* QR 스캔 모의 모달 UI */}
      {isQrScanning && (
        <div className="modalOverlay">
          <div className="modalCard">
            <span className="modalIcon">📍</span>
            <h3>매장 위치 & QR 인증 중...</h3>
            <p>현장 제보 어뷰징 방지를 위해 위치 정보를 확인하고 있습니다.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="header">
        <div className="logo" onClick={goHome}>
          빈틈<span>BEENTEUM</span>
        </div>

        <nav>
          <button onClick={goHome}>카페 탐색</button>

          <button onClick={() => setPage("favorites")}>즐겨찾기</button>

          <button onClick={() => setPage("adminLogin")}>관리자</button>

          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setPage("home");
                showToast("로그아웃 되었습니다.");
              }}
            >
              로그아웃
            </button>
          ) : (
            <button onClick={() => setPage("login")}>로그인</button>
          )}
        </nav>
      </header>

      {/* HOME */}
      {page === "home" && (
        <main className="home">
          <section className="hero">
            <p className="eyebrow">PURPOSE-BASED CAFE SEARCH</p>

            <h1>
              오늘은 어떤 공간이
              <br />
              필요하세요?
            </h1>

            <p className="heroText">
              방문 목적에 맞는 카페를 찾고
              <br />
              실제 이용자의 혼잡도 정보를 확인해보세요.
            </p>

            <div className="locationBox">
              <span>📍</span>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="지역을 입력해주세요"
              />

              <button
                onClick={() => {
                  if (!location) {
                    setLocation("한양여대");
                  }
                }}
              >
                현재 위치
              </button>
            </div>
          </section>

          <section className="purposeSection">
            <div className="sectionTitle">
              <h2>방문 목적을 선택해주세요</h2>
              <p>하나의 목적을 선택하면 공간 조건에 맞춰 추천해드려요.</p>
            </div>

            <div className="purposeGrid">
              {purposes.map((purpose) => (
                <button
                  className="purposeCard"
                  key={purpose.id}
                  onClick={() => selectPurpose(purpose.id)}
                >
                  <span className="purposeIcon">{purpose.icon}</span>

                  <strong>{purpose.title}</strong>

                  <span>{purpose.description}</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* CONDITIONS */}
      {page === "conditions" && (
        <main className="page">
          <button className="backButton" onClick={goHome}>
            ← 뒤로가기
          </button>

          <section className="conditionPage">
            <p className="eyebrow">STEP 2</p>

            <h1>
              {selectedPurposeData?.title}에
              <br />
              어떤 공간이 필요하세요?
            </h1>

            <p className="pageDescription">
              원하는 조건을 선택하면 조건에 맞는 카페를 추천해드려요.
            </p>

            <div className="conditionGrid">
              {selectedPurposeData?.conditions.map((condition) => (
                <button
                  key={condition}
                  className={`conditionCard ${
                    selectedConditions.includes(condition) ? "selected" : ""
                  }`}
                  onClick={() => toggleCondition(condition)}
                >
                  <span>
                    {selectedConditions.includes(condition) ? "✓" : "○"}
                  </span>

                  <strong>{condition}</strong>
                </button>
              ))}
            </div>

            <button className="primaryButton" onClick={makeRecommendation}>
              이 조건으로 카페 추천받기 →
            </button>
          </section>
        </main>
      )}

      {/* RECOMMEND */}
      {page === "recommend" && (
        <main className="page">
          <button
            className="backButton"
            onClick={() => setPage("conditions")}
          >
            ← 조건 다시 선택
          </button>

          <div className="recommendHeader">
            <p className="eyebrow">RECOMMENDATION</p>

            <h1>
              {selectedPurposeData?.title}에 맞는
              <br />
              카페를 추천해드려요
            </h1>

            <div className="selectedCondition">
              <span>선택한 조건</span>

              {selectedConditions.length > 0 ? (
                selectedConditions.map((condition) => (
                  <b key={condition}>{condition}</b>
                ))
              ) : (
                <b>기본 조건</b>
              )}
            </div>
          </div>

          <div className="cafeList">
            {recommendedCafes.map((cafe, index) => (
              <article className="cafeCard" key={cafe.id}>
                <div className="cafeRank">{index + 1}</div>

                <div className="cafeMain">
                  <div className="cafeTop">
                    <div>
                      <h3>{cafe.name}</h3>
                      <p>{cafe.distance}</p>
                    </div>

                    <button
                      className="heartButton"
                      onClick={() => toggleFavorite(cafe.id)}
                    >
                      {favorites.includes(cafe.id) ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="cafeTags">
                    <span>{cafe.congestion}</span>
                    <span>신뢰도 {cafe.reliability}</span>

                    {cafe.outlets && <span>콘센트</span>}
                    {cafe.wifi && <span>Wi-Fi</span>}
                  </div>

                  <p className="recommendReason">
                    ✓{" "}
                    {selectedPurpose === "study" &&
                      "집중하기 좋은 공간 조건을 갖추고 있어요."}
                    {selectedPurpose === "work" &&
                      "노트북 업무에 필요한 공간 조건이 좋아요."}
                    {selectedPurpose === "talk" &&
                      "대화하기 좋은 좌석과 소음 환경이에요."}
                    {selectedPurpose === "rest" &&
                      "여유로운 혼잡도와 편안한 공간이에요."}
                  </p>

                  <div className="cafeActions">
                    <button onClick={() => openCafe(cafe)}>상세보기</button>

                    <button
                      className={
                        compareList.includes(cafe.id) ? "active" : ""
                      }
                      onClick={() => toggleCompare(cafe.id)}
                    >
                      {compareList.includes(cafe.id)
                        ? "비교 선택됨"
                        : "비교하기"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {compareList.length > 0 && (
            <button
              className="floatingCompare"
              onClick={() => setPage("compare")}
            >
              {compareList.length}개 카페 비교하기 →
            </button>
          )}
        </main>
      )}

      {/* DETAIL */}
      {page === "detail" && selectedCafe && (
        <main className="page">
          <button
            className="backButton"
            onClick={() => setPage("recommend")}
          >
            ← 카페 목록
          </button>

          <section className="detail">
            <div className="detailHeader">
              <div>
                <p className="eyebrow">CAFE DETAIL</p>

                <h1>{selectedCafe.name}</h1>

                <p>{selectedCafe.distance} · 현재 영업 중</p>
              </div>

              <button
                className="heartButton large"
                onClick={() => toggleFavorite(selectedCafe.id)}
              >
                {favorites.includes(selectedCafe.id) ? "♥" : "♡"}
              </button>
            </div>

            <div className="congestionBox">
              <p>현재 혼잡도</p>

              <strong>{selectedCafe.congestion}</strong>

              <span>신뢰도 {selectedCafe.reliability}</span>
            </div>

            <div className="infoGrid">
              <div>
                <span>콘센트</span>
                <strong>{selectedCafe.outlets ? "있음" : "없음"}</strong>
              </div>

              <div>
                <span>Wi-Fi</span>
                <strong>{selectedCafe.wifi ? "있음" : "없음"}</strong>
              </div>

              <div>
                <span>소음</span>
                <strong>{selectedCafe.noise}</strong>
              </div>

              <div>
                <span>좌석</span>
                <strong>{selectedCafe.seats}</strong>
              </div>
            </div>

            {/* 5번 피드백: 지도 더미 박스 UI */}
            <div className="mapDummyBox">
              <span className="mapIcon">🗺️</span>
              <p>
                <strong>카카오 지도 연결 영역</strong> ({selectedCafe.name} :{" "}
                {selectedCafe.distance})
              </p>
            </div>

            <div className="detailButtons">
              <button
                className="primaryButton"
                onClick={() =>
                  showToast("카카오맵 길찾기 웹페이지로 연결됩니다.")
                }
              >
                📍 길찾기
              </button>

              {isLoggedIn && (
                <button className="secondaryButton" onClick={startQrReport}>
                  QR 현장 제보
                </button>
              )}
            </div>
          </section>
        </main>
      )}

      {/* COMPARE */}
      {page === "compare" && (
        <main className="page">
          <button
            className="backButton"
            onClick={() => setPage("recommend")}
          >
            ← 추천 목록
          </button>

          <div className="sectionTitle">
            <p className="eyebrow">COMPARE</p>

            <h1>카페 비교하기</h1>

            <p>선택한 카페의 공간 정보를 비교해보세요.</p>
          </div>

          <div className="compareGrid">
            {cafes
              .filter((cafe) => compareList.includes(cafe.id))
              .map((cafe) => (
                <div className="compareCard" key={cafe.id}>
                  <h3>{cafe.name}</h3>

                  <div>
                    <span>거리</span>
                    <strong>{cafe.distance}</strong>
                  </div>

                  <div>
                    <span>혼잡도</span>
                    <strong>{cafe.congestion}</strong>
                  </div>

                  <div>
                    <span>콘센트</span>
                    <strong>{cafe.outlets ? "있음" : "없음"}</strong>
                  </div>

                  <div>
                    <span>Wi-Fi</span>
                    <strong>{cafe.wifi ? "있음" : "없음"}</strong>
                  </div>

                  <div>
                    <span>소음</span>
                    <strong>{cafe.noise}</strong>
                  </div>

                  <div>
                    <span>좌석</span>
                    <strong>{cafe.seats}</strong>
                  </div>

                  <button onClick={() => openCafe(cafe)}>이 카페 보기</button>
                </div>
              ))}
          </div>
        </main>
      )}

      {/* ADMIN LOGIN */}
      {page === "adminLogin" && (
        <main className="page authPage">
          <section className="authBox">
            <p className="eyebrow">BEENTEUM ADMIN</p>

            <h1>관리자 로그인</h1>

            <input placeholder="관리자 이메일" />

            <input type="password" placeholder="관리자 비밀번호" />

            <button
              className="primaryButton"
              onClick={() => {
                setAdminLoggedIn(true);
                setPage("admin");
                showToast("관리자 대시보드로 이동했습니다.");
              }}
            >
              관리자 로그인
            </button>

            <button className="textButton" onClick={() => setPage("home")}>
              돌아가기
            </button>
          </section>
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "admin" && adminLoggedIn && (
        <main className="page">
          <div className="sectionTitle">
            <p className="eyebrow">BEENTEUM ADMIN</p>

            <h1>관리자 대시보드</h1>

            <p>카페와 사용자 제보를 관리할 수 있어요.</p>
          </div>

          <div className="adminMenuGrid">
            <button
              className="adminMenuCard"
              onClick={() => setPage("adminCafe")}
            >
              <span>☕</span>

              <strong>카페·공간 정보 관리</strong>

              <p>카페 기본 정보와 공간 정보를 관리합니다.</p>
            </button>

            <button
              className="adminMenuCard"
              onClick={() => setPage("adminReports")}
            >
              <span>📋</span>

              <strong>사용자 제보 조회</strong>

              <p>사용자가 등록한 현장 제보를 확인합니다.</p>
            </button>

            <button
              className="adminMenuCard"
              onClick={() => setPage("adminStatus")}
            >
              <span>✓</span>

              <strong>제보 상태 관리</strong>

              <p>정상·검토·비정상 제보를 관리합니다.</p>
            </button>

            <button
              className="adminMenuCard"
              onClick={() => setPage("adminHistory")}
            >
              <span>🕘</span>

              <strong>변경 이력</strong>

              <p>카페 정보의 변경 이력을 확인합니다.</p>
            </button>
          </div>

          <button
            className="secondaryButton"
            onClick={() => {
              setAdminLoggedIn(false);
              setPage("home");
              showToast("관리자 로그아웃 되었습니다.");
            }}
          >
            관리자 로그아웃
          </button>
        </main>
      )}

      {/* ADMIN CAFE */}
      {page === "adminCafe" && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("admin")}>
            ← 관리자 대시보드
          </button>

          <div className="sectionTitle">
            <p className="eyebrow">ADMIN · CAFE</p>

            <h1>카페·공간 정보 관리</h1>

            <p>등록된 카페와 공간 정보를 확인합니다.</p>
          </div>

          <div className="adminList">
            {cafes.map((cafe) => (
              <div className="adminListCard" key={cafe.id}>
                <div>
                  <h3>{cafe.name}</h3>

                  <p>
                    거리 {cafe.distance} · 혼잡도 {cafe.congestion}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCafe(cafe);
                    setPage("adminCafeEdit");
                  }}
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ADMIN CAFE EDIT - 4번 피드백: 테이블 스타일링 개선 */}
      {page === "adminCafeEdit" && selectedCafe && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("adminCafe")}>
            ← 카페·공간 정보 관리
          </button>

          <section className="adminEditPage">
            <p className="eyebrow">ADMIN · CAFE EDIT</p>

            <h1>{selectedCafe.name} 정보 수정</h1>

            <p className="editDescription">
              카페의 기본 정보와 공간 정보를 수정합니다.
            </p>

            <table className="adminEditTable">
              <tbody>
                <tr>
                  <th>카페 이름</th>
                  <td>
                    <input defaultValue={selectedCafe.name} />
                  </td>
                </tr>
                <tr>
                  <th>거리</th>
                  <td>
                    <input defaultValue={selectedCafe.distance} />
                  </td>
                </tr>
                <tr>
                  <th>혼잡도</th>
                  <td>
                    <select defaultValue={selectedCafe.congestion}>
                      <option>여유</option>
                      <option>보통</option>
                      <option>혼잡</option>
                      <option>정보 부족</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>좌석</th>
                  <td>
                    <select defaultValue={selectedCafe.seats}>
                      <option>넉넉함</option>
                      <option>보통</option>
                      <option>부족</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>소음</th>
                  <td>
                    <select defaultValue={selectedCafe.noise}>
                      <option>낮음</option>
                      <option>보통</option>
                      <option>높음</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>콘센트</th>
                  <td>
                    <select
                      defaultValue={selectedCafe.outlets ? "있음" : "없음"}
                    >
                      <option>있음</option>
                      <option>없음</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Wi-Fi</th>
                  <td>
                    <select defaultValue={selectedCafe.wifi ? "있음" : "없음"}>
                      <option>있음</option>
                      <option>없음</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="editButtons">
              <button
                className="secondaryButton"
                onClick={() => setPage("adminCafe")}
              >
                취소
              </button>

              <button
                className="primaryButton"
                onClick={() => {
                  showToast("카페 정보가 수정되었습니다.");
                  setPage("adminCafe");
                }}
              >
                수정 내용 저장
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ADMIN REPORTS */}
      {page === "adminReports" && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("admin")}>
            ← 관리자 대시보드
          </button>

          <div className="sectionTitle">
            <p className="eyebrow">ADMIN · REPORTS</p>

            <h1>사용자 제보 조회</h1>

            <p>사용자가 등록한 현장 제보를 확인합니다.</p>
          </div>

          <div className="adminReportCard">
            <h3>카페 온도</h3>

            <p>제보 시간: 2026-09-30 18:20</p>
            <p>혼잡도: 여유</p>
            <p>좌석: 넉넉함</p>
            <p>소음: 낮음</p>

            <span className="statusBadge">정상</span>
          </div>

          <div className="adminReportCard">
            <h3>커피하우스 101</h3>

            <p>제보 시간: 2026-09-30 17:50</p>
            <p>혼잡도: 보통</p>
            <p>좌석: 보통</p>
            <p>소음: 보통</p>

            <span className="statusBadge">정상</span>
          </div>
        </main>
      )}

      {/* ADMIN STATUS */}
      {page === "adminStatus" && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("admin")}>
            ← 관리자 대시보드
          </button>

          <div className="sectionTitle">
            <p className="eyebrow">ADMIN · STATUS</p>

            <h1>제보 상태 관리</h1>

            <p>사용자 제보의 상태를 관리합니다.</p>
          </div>

          <div className="adminStatusCard">
            <h3>카페 온도 · 제보 #001</h3>

            <div className="statusButtons">
              <button onClick={() => showToast("정상 제보로 처리되었습니다.")}>
                정상
              </button>

              <button
                onClick={() => showToast("검토 대상 제보로 처리되었습니다.")}
              >
                검토
              </button>

              <button
                onClick={() => showToast("비정상 제보로 처리되었습니다.")}
              >
                비정상
              </button>
            </div>
          </div>

          <div className="adminStatusCard">
            <h3>커피하우스 101 · 제보 #002</h3>

            <div className="statusButtons">
              <button onClick={() => showToast("정상 제보로 처리되었습니다.")}>
                정상
              </button>

              <button
                onClick={() => showToast("검토 대상 제보로 처리되었습니다.")}
              >
                검토
              </button>

              <button
                onClick={() => showToast("비정상 제보로 처리되었습니다.")}
              >
                비정상
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ADMIN HISTORY */}
      {page === "adminHistory" && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("admin")}>
            ← 관리자 대시보드
          </button>

          <div className="sectionTitle">
            <p className="eyebrow">ADMIN · HISTORY</p>

            <h1>변경 이력</h1>

            <p>카페 정보의 변경 이력을 확인합니다.</p>
          </div>

          <div className="historyList">
            <div className="historyCard">
              <strong>카페 온도</strong>

              <p>좌석 정보 변경: 보통 → 넉넉함</p>

              <span>관리자 · 2026-09-30 16:30</span>
            </div>

            <div className="historyCard">
              <strong>브릭커피</strong>

              <p>소음 정보 변경: 보통 → 높음</p>

              <span>관리자 · 2026-09-29 14:10</span>
            </div>
          </div>
        </main>
      )}

      {/* LOGIN */}
      {page === "login" && (
        <main className="page authPage">
          <section className="authBox">
            <p className="eyebrow">WELCOME TO BEENTEUM</p>

            <h1>로그인</h1>

            <input placeholder="이메일" />

            <input type="password" placeholder="비밀번호" />

            <button
              className="primaryButton"
              onClick={() => {
                setIsLoggedIn(true);
                setPage("home");
                showToast("로그인 되었습니다.");
              }}
            >
              로그인
            </button>

            <button className="textButton" onClick={() => setPage("signup")}>
              회원가입
            </button>
          </section>
        </main>
      )}

      {/* SIGNUP */}
      {page === "signup" && (
        <main className="page authPage">
          <section className="authBox">
            <p className="eyebrow">JOIN BEENTEUM</p>

            <h1>회원가입</h1>

            <input placeholder="이메일" />

            <input type="password" placeholder="비밀번호" />

            <input type="password" placeholder="비밀번호 확인" />

            <button
              className="primaryButton"
              onClick={() => {
                showToast("회원가입이 완료되었습니다.");
                setPage("login");
              }}
            >
              회원가입
            </button>

            <button className="textButton" onClick={() => setPage("login")}>
              로그인으로 돌아가기
            </button>
          </section>
        </main>
      )}

      {/* FAVORITES */}
      {page === "favorites" && (
        <main className="page">
          <div className="sectionTitle">
            <p className="eyebrow">MY FAVORITES</p>

            <h1>즐겨찾기</h1>
          </div>

          {!isLoggedIn ? (
            <div className="emptyBox">
              <p>로그인 후 즐겨찾기를 확인할 수 있어요.</p>

              <button
                className="primaryButton"
                onClick={() => setPage("login")}
              >
                로그인하기
              </button>
            </div>
          ) : favorites.length === 0 ? (
            <div className="emptyBox">
              <p>아직 저장한 카페가 없어요.</p>
            </div>
          ) : (
            <div className="cafeList">
              {cafes
                .filter((cafe) => favorites.includes(cafe.id))
                .map((cafe) => (
                  <article className="cafeCard" key={cafe.id}>
                    <div className="cafeMain">
                      <div className="cafeTop">
                        <div>
                          <h3>{cafe.name}</h3>

                          <p>{cafe.distance}</p>
                        </div>

                        <button
                          className="heartButton"
                          onClick={() => toggleFavorite(cafe.id)}
                        >
                          ♥
                        </button>
                      </div>

                      <div className="cafeTags">
                        <span>{cafe.congestion}</span>

                        <span>신뢰도 {cafe.reliability}</span>
                      </div>

                      <button onClick={() => openCafe(cafe)}>상세보기</button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </main>
      )}

      {/* REPORT - 3번 피드백: 제보 완료 시 실제 카페 State 반영 */}
      {page === "report" && selectedCafe && (
        <main className="page">
          <button className="backButton" onClick={() => setPage("detail")}>
            ← 카페 상세
          </button>

          <section className="reportPage">
            <p className="eyebrow">FIELD REPORT</p>

            <h1>현장 상태를 알려주세요</h1>

            <p>
              QR 및 현장 인증이 완료된 상태라고 가정하고 현재 카페 상태를
              제보합니다.
            </p>

            <div className="reportSection">
              <h3>혼잡도 *</h3>

              <div className="reportOptions">
                {["여유", "보통", "혼잡"].map((item) => (
                  <button
                    key={item}
                    className={
                      reportData.congestion === item ? "selected" : ""
                    }
                    onClick={() =>
                      setReportData((prev) => ({
                        ...prev,
                        congestion: item,
                      }))
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="reportSection">
              <h3>좌석 여유</h3>

              <div className="reportOptions">
                {["여유", "보통", "부족"].map((item) => (
                  <button
                    key={item}
                    className={reportData.seats === item ? "selected" : ""}
                    onClick={() =>
                      setReportData((prev) => ({
                        ...prev,
                        seats: item,
                      }))
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="reportSection">
              <h3>소음 수준</h3>

              <div className="reportOptions">
                {["낮음", "보통", "높음"].map((item) => (
                  <button
                    key={item}
                    className={reportData.noise === item ? "selected" : ""}
                    onClick={() =>
                      setReportData((prev) => ({
                        ...prev,
                        noise: item,
                      }))
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="primaryButton"
              onClick={() => {
                if (!reportData.congestion) {
                  showToast("혼잡도를 선택해주세요.");
                  return;
                }

                // 백엔드 비즈니스 로직 적용 모의: State 업데이트 및 상세 뱃지 변경
                const updatedCafes = cafes.map((cafe) =>
                  cafe.id === selectedCafe.id
                    ? {
                        ...cafe,
                        congestion: reportData.congestion,
                        seats: reportData.seats || cafe.seats,
                        noise: reportData.noise || cafe.noise,
                      }
                    : cafe
                );

                setCafes(updatedCafes);
                const updatedSelected = updatedCafes.find(
                  (c) => c.id === selectedCafe.id
                );
                setSelectedCafe(updatedSelected);

                showToast("현장 제보가 등록되어 혼잡도가 갱신되었습니다.");

                setReportData({
                  congestion: "",
                  seats: "",
                  noise: "",
                });

                setPage("detail");
              }}
            >
              제보 완료
            </button>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
