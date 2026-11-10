# ⚡ Hackaday.io(해커데이) 기준 '내가 바로 만들 만한 쌈빡한 오픈소스 하드웨어' TOP 6

> **선정 기준**:
> 1. **비주얼 임팩트("우와 이거 뭐야?")**: 데스크테리어·공구·메이커 시장에서 사진/움짤 한 장으로 시선을 압도하는가?
> 2. **오픈소스 완성도**: 회로도(PCB Gerber) + 3D 프린팅 외장 도면(STL/STEP) + 펌웨어 코드가 공개되어 있어 맨땅에서 개발할 필요가 없는가?
> 3. **대표님 보유 역량과의 시너지**: **3D 프린팅(뱀부랩/중국 나일론 공방)** + **무선에어건(모터/마끼다 배터리)** + **RK3566/ESP32 보드** 생태계와 부품·공정이 겹치는가?
> 4. **압도적 마진율**: 중국 부품 원가 2만~4만 원대로 만들어서 국내(스마트스토어·와디즈·오늘의집)에서 **8만~20만 원대**에 팔 수 있는가?

---

## 🏆 1위. SmartKnob (스마트 햅틱 다이얼 노브 — BLDC 모터 + 원형 디스플레이)

- **해커데이 직링크**:
  - [Smart Knob (by hongyicai)](https://hackaday.io/project/191447-smart-knob)
  - [MaTouch SmartKnob 양산형 구조 레퍼런스](https://hackaday.io/project/196878-matouch-smartknob-assembled)
- **어떤 물건인가?**:
  - 다이얼 한가운데 동그란 IPS LCD 화면이 들어있고, 물리적인 톱니 대신 **초박형 브러시리스 짐벌 모터(BLDC) + 자기 엔코더 + ESP32**로 구동되는 미래형 스마트 다이얼입니다.
  - 화면 모드에 따라 모터 코일의 전자기력을 제어(`SimpleFOC`)하여 **'묵직한 금고 다이얼 느낌', '1도씩 딱딱 끊어지는 정밀 클릭감', '끝에서 튕겨 나오는 스프링 저항감', '무한 회전 베어링 느낌'을 소프트웨어로 실시간 변환**합니다!
- **예상 원가 vs 국내 판매가**:
  - **중국 제조 원가**: 약 **25,000원 ~ 35,000원** (짐벌 모터 약 4,000원 + 원형 LCD + ESP32 PCBA + 3D프린팅/CNC 외장)
  - **국내 예상 판매가**: **129,000원 ~ 189,000원** (영상 편집 조그셔틀 / 오디오 볼륨 노브 / 스마트홈 컨트롤러 / 데스크테리어 끝판왕)

---

## 🏆 2위. Galaxy6D & MagMouse (정품 50만 원짜리 3D CAD 우주마우스를 2만 원에 구현한 '6축 6-DOF 스페이스마우스')

- **해커데이 직링크**:
  - [Galaxy6D: Simple DIY Full 6D Space Mouse](https://hackaday.io/project/192855-galaxy6d-simple-diy-full-6d-space-mouse)
  - [MagMouse: 단일 PCB 기반 초소형 무선 6DOF SpaceMouse](https://hackaday.io/project/204651-magmouse)
- **어떤 물건인가?**:
  - 3D 모델링(Fusion 360, SolidWorks, Rhino, Blender)을 할 때 왼손으로 노브를 살짝 밀고·당기고·비틀고·기울이면 3D 모델이 우주 공간에 떠 있는 것처럼 6방향(6-DOF)으로 부드럽게 회전·이동하는 **3D 전문가용 보조 마우스**입니다.
  - 정품(3Dconnexion SpaceMouse)은 **25만~55만 원**이라 3D 프린터 유저들이 침만 흘리는데, `MagMouse`는 **단 한 장의 PCB + 3D 홀 자기 센서 + 네오디뮴 자석 배열 + 3D 프린팅 탄성 구조물 + XIAO ESP32-S3(블루투스 무선)**로 이를 완벽히 대체했습니다.
- **예상 원가 vs 국내 판매가**:
  - **중국 제조 원가**: **20달러(약 27,000원) 미만**
  - **국내 예상 판매가**: **79,000원 ~ 119,000원** (한국 3D 프린터 유저·메이커·기구설계 입문자들에게 가장 폭발적으로 팔릴 아이템 1순위!)

---

## 🏆 3위. 무선에어건 기술 100% 호환 파생작 — '무선 터보 분진·납연기 집진기' & '다이슨형 날개 없는 브러시리스 팬' & '마끼다 파워스테이션'

- **해커데이 직링크**:
  - [Solder Fume Extraction Station Deluxe (USB-C PD + 18650 무선 스마트 집진기)](https://hackaday.io/project/187925-solder-fume-extraction-station-deluxe-from-scrap)
  - [Bladeless Fan (고속 브러시리스 모터 기반 날개 없는 에어 멀티플라이어)](https://hackaday.io/project/174319-bladeless-fan)
  - [Makita LXT Power Station (마끼다 18V 배터리 결합형 포터블 파워스테이션)](https://hackaday.io/project/194783-makita-lxt-power-station)
- **왜 대표님께 최고인가? (무선에어건 부품 90% 공유!)**:
  - 현재 구상 중이신 **무선에어건의 핵심 부품(고속 브러시리스 모터 + ESC 속도제어기 + 마끼다/18650 배터리 + 3D 프린팅 풍도 설계)**을 그대로 쓰면서 외장 디자인과 필터만 결합하면 3가지 고단가 신제품이 즉시 탄생합니다:
    1. **데스크탑 무선 터보 집진기**: 프라모델·건프라 사포질 분진, 네일아트 분진, 3D 프린팅 유해가스, 납땜 연기를 빨아들이는 헤파/활성탄 필터 일체형 무선 흡입기.
    2. **날개 없는 데스크테리어 미니 터보 선풍기 (`Bladeless Fan`)**: 고속 브러시리스 덕트팬을 하단 기둥에 숨기고 상단 링으로 바람을 뿜어내는 다이슨형 책상 선풍기.
    3. **마끼다 18V 배터리 멀티 독(Dock)**: 현장·캠핑에서 마끼다 배터리에 끼워 에어건 + USB-C PD 100W 충전기 + 작업등으로 쓰는 멀티 어댑터.

---

## 🏆 4위. beyblock20 (자석으로 '찰칵' 무한 합체되는 마그네틱 모듈형 매크로패드)

- **해커데이 직링크**:
  - [beyblock20: The Modular, Magnetic Macropad](https://hackaday.io/project/186937-beyblock20-the-modular-magnetic-macropad)
- **어떤 물건인가?**:
  - 측면에 자석과 포고핀(Pogo Pin)이 내장되어 있어, 기본 키패드 옆에 **'로터리 다이얼 모듈', '미니 OLED 모듈', '추가 4키 모듈'을 레고처럼 자석으로 붙이는 순간 자동 연동**되는 모듈형 매크로 키보드입니다.
- **사업화 포인트**:
  - PCB가 매우 단순하고 케이스는 100% 3D 프린팅입니다. 본체 구매자가 추가 모듈(개당 1.5만~2.5만 원)을 계속 사게 만드는 **고마진 확장형 비즈니스 모델**입니다.

---

## 🏆 5위. DIY USB-C PD 100W 포켓 리플로우 핫플레이트 (`Reflow.Card` & `MCH USB-PD Hotplate`)

- **해커데이 직링크**:
  - [DIY USB-PD Powered MCH Automatic Reflow Hotplate](https://hackaday.io/project/194305-diy-usb-pd-powered-mch-automatic-reflow-hotplate)
  - [Reflow.Card (명함 크기 스택형 USB-PD 100W 핫플레이트)](https://hackaday.io/project/196747-reflowcard)
- **어떤 물건인가?**:
  - 스마트폰 충전기(USB-C PD 65W~100W)를 꽂으면 명함 절반 크기의 세라믹 히터(MCH)가 250℃까지 자동으로 온도 곡선을 제어하며 초소형 PCB 기판을 납땜(리플로우)해 주는 **사이버펑크 스타일 포켓 핫플레이트**입니다.
- **사업화 포인트**:
  - 대표님께서 RK3566이나 에어건 제어 기판을 직접 수정·테스트하실 때 **본인 작업용으로도 1대 꼭 있으면 좋은 장비**이자, 부품 원가 1.2만 원으로 만들어 메이커들에게 4~6만 원대에 팔 수 있는 효자 공구입니다.

---

## 🏆 6위. 포켓 사이버덱 핸드헬드 리눅스 터미널 (`Cyberdeck Handheld` / `HamDeck`) — RK3566 활용 끝판왕!

- **해커데이 직링크**:
  - [Cyberdeck Handheld (기계식 키패드 + 소형 디스플레이 포켓 리눅스 머신)](https://hackaday.io/project/202522-cyberdeck-handheld)
  - [HamDeck Cyberdeck (포터블 야전 리눅스 터미널)](https://hackaday.io/project/191890-hamdeck-cyberdeck/details)
- **어떤 물건인가?**:
  - 앞서 눈여겨보신 **RK3566(타이산파이 등 2만 원대 리눅스 보드)**을 가장 멋지게 상품화할 수 있는 장르입니다.
  - **4~5인치 IPS 화면 + 미니 기계식 쿼티(QWERTY) 키보드 + 18650 배터리 + 노출형 금속 방열판 + 3D 프린팅 밀리터리/사이버펑크 하우징**을 결합해, 손바닥 위에서 리눅스·코딩·레트로 게임·네트워크 진단·AI 비서를 돌리는 **'사이버덱(Cyberdeck)'**입니다.
  - 한국에는 이런 감성의 완제품/키트를 파는 곳이 전무해서, 개발자·IT 매니아 타겟 와디즈 펀딩이나 한정판 커스텀 제작으로 부르는 게 값인 영역입니다.
