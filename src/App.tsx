import React from "react";
import "./app.scss";

import { useSelector, useDispatch } from "react-redux";
import { setKeyBoard, setReset } from "./redux/slices/textSlice";

import { RootState, AppDispatch } from "./redux/store";
import { fetchText } from "./redux/slices/textSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const currentIndex = useSelector(
    (store: RootState) => store.textStore.currentIndex
  ); // отслеживать идекс при вводе пользователем
  const error = useSelector((store: RootState) => store.textStore.error); // накопления ошибок
  const isError = useSelector((store: RootState) => store.textStore.isError); // проверка на накопление ошибок флагом
  const flagTime = useSelector((store: RootState) => store.textStore.flagTime); // флаг для таймера, чтобы начать и останавливать его
  const text = useSelector((store: RootState) => store.textStore.text); // основной текст

  const [time, setTime] = React.useState(0); // таймер для метрик
  const [timeRender, setTimeRender] = React.useState("00:00");

  const [lastIndex, setLastIndex] = React.useState<string | null>(() => {
    const getIndex = localStorage.getItem("lastIndex");
    return getIndex ? JSON.parse(getIndex) : "0";
  }); // проверка на повторный текст, сохранение в локальное хранилище для опять же проверки на прошлый текст

  const focusRef = React.useRef<HTMLDivElement>(null); // фокусирование на тексте при кнопке старт и заного

  // запрос на апи
  const getData = async (id: number) => {
    dispatch(fetchText(id));
  };

  // при клике на кнопку заного сбрасывает все параметры
  const onClickAgain = () => {
    setTime(0);
    dispatch(
      setReset({
        currentIndex: currentIndex,
        error: error,
        flagTime: flagTime,
      })
    );
  };

  //установка таймера для пользователя, также расчет времени за час, то тогда вылетает alert и все сбрасывается
  React.useEffect(() => {
    const minut = Math.floor(time / 60);
    const second = time % 60;

    if (minut === 59 && second === 59) {
      setTimeRender("00:00");
      onClickAgain();
      alert("Вы привысили время, начните сначала");
    }

    setTimeRender(
      `${minut.toString().padStart(2, "0")}:${second
        .toString()
        .padStart(2, "0")}`
    );
  }, [time, onClickAgain]);

  // таймер для подсчета слов в минуту
  React.useEffect(() => {
    if (!flagTime) return;

    const timer = setTimeout(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [flagTime, time]);

  // выводит рандомное число для подбора текста и проверяет прошлый текст и нынешний, если
  // прошлый и новый совпадают, то новому прибавляется один и передается на апи
  const getRandomArbitrary = React.useCallback(
    (min: number, max: number) => {
      let randomNumber = Math.floor(Math.random() * (max - min) + min);

      if (randomNumber === Number(lastIndex)) {
        randomNumber = (randomNumber + 1) % max;
      }
      const random = randomNumber.toString();

      localStorage.setItem("lastIndex", JSON.stringify(random));
      setLastIndex(random);
      return getData(randomNumber);
    },
    [lastIndex, getData]
  );

  // focus text
  React.useEffect(() => {
    if (text && focusRef.current) {
      focusRef.current.focus();
    }
  }, [text, currentIndex]);

  // for tracing letter of user
  const keyBoard = (e: React.KeyboardEvent<HTMLDivElement>) => {
    dispatch(
      setKeyBoard({
        key: e.key,
      })
    );
  };

  return (
    <div
      className="container"
      style={{ display: text.length !== 0 ? "flex" : "" }}
    >
      {text.length !== 0 && (
        <>
          <div
            className="main-text"
            onKeyDown={keyBoard}
            tabIndex={0}
            ref={focusRef}
          >
            {text.map((item, index) => (
              <span
                className={`${
                  index === currentIndex
                    ? isError
                      ? "error-char"
                      : "success-char"
                    : ""
                } ${index < currentIndex && "success-text"}`}
                key={index}
              >
                {item}
              </span>
            ))}
          </div>

          <div className="side-right">
            <div className="info">
              <div className="error">
                <p className="title">Ошибки</p>
                <span className="count">{error}</span>
              </div>
              <div className="speed">
                <p className="title">Таймер</p>
                <span className="count">{timeRender}</span>
              </div>

              <div className="accurancy">
                <p className="title">Точность</p>
                <span className="count">
                  {(((text.length - error) / text.length) * 100).toFixed(2)}
                </span>
              </div>

              {!flagTime && time > 0 && (
                <div className="words">
                  <p className="title">Знаков в минуту</p>
                  <span className="count">
                    {((text.length / time) * 60).toFixed(0)} зн/мин
                  </span>
                </div>
              )}
            </div>
            <div className="again">
              <button className="again-btn" onClick={() => onClickAgain()}>
                Заного
              </button>
            </div>
          </div>
        </>
      )}

      <div className="btn" style={{ height: "400px" }}>
        {text.length === 0 && (
          <button
            onClick={() => getRandomArbitrary(1, 4)}
            className="btn-start"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
