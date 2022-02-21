document.addEventListener("DOMContentLoaded", function () {


    /*функция показывает в консоли элементы, 
    которые выходят за границы основного блока, 
    и тогда появляется горизонтальная полоса прокрутки*/
    const docWidth = document.documentElement.offsetWidth;

    [].forEach.call(
        document.querySelectorAll('*'),
        function (el) {
            if (el.offsetWidth > docWidth) {
                console.log(el);
            }
        }
    );

    /*Функция День/Ночь, меняет оформление страницы в зависимости от времени суток*/
    const changeTheme = () => {
        let date = new Date();
        let hour = date.getHours();
        const whiteThemeElements = document.querySelectorAll('[data-theme]');
        if (hour >= 7 && hour < 19) {
            whiteThemeElements.forEach(element => {
                element.classList.add("white-theme");
            });
        } else {
            whiteThemeElements.forEach(element => {
                element.classList.remove("white-theme");
            });
        }
    }

    window.addEventListener('load', changeTheme);

    /*Фунции игры*/
    const memoryCards = document.querySelectorAll('.memory-card');
    const scoreBlock = document.querySelector('.result-score');
    const penaltyBlock = document.querySelector('.result-penalty');
    const totalScoreBlock = document.querySelector('.result-total');
    const timeBlock = document.querySelector('.result-time');
    const playAgainButton = document.querySelector('.play-again-button');
    const totalGameBlock = document.querySelector('.total-game-container');
    const totalGameCloseButton = document.querySelector('.total-game-close');
    const totalGameTime = document.querySelector('.total-game-time');
    const totalGameScore = document.querySelector('.total-game-score');
    const totalGameMoves = document.querySelector('.total-game-moves');
    const totalGameOverallResult = document.querySelector('.total-game-result');
    const resultTableButton = document.querySelector('.result-table-button');
    const resultTableContainer = document.querySelector('.result-table-container');
    const resultTableCloseButton = document.querySelector('.result-table-close');
    const resultTableScore = document.querySelectorAll('.table-score');
    const resultTableTime = document.querySelectorAll('.table-time');

    let hasReverse = false; /*перевернута ли карта*/
    let firstCard; /*первая выбранная карта*/
    let secondCard; /*вторая выбранная карта*/
    let limit = false; /*лимит в две карты*/
    let scoreCount = 0; /*счет совпавших пар, 30 очков за каждую*/
    let penaltyCount = 0; /*счет несовпавших пар, 1 очко за каждую*/
    let totalScore = 0; /*общий счет за игру, из расчета scoreCount - penaltyCount,
    если счет пенальти будет больше счета за пары - общий счет равняется 0*/
    let timeInterval = 0; /*счетчик секунд*/
    let timerId; /*переменная, содержащая setInterval, 
    для остановки времени на финале игры и вывода общего времение игры*/
    let seconds = 0;
    let minutes = 0;
    let time;
    let minutesValue;
    let secondsValue;
    let cardPairCount = 0; /*количество совпавший пар. Когда достигает 10, срабатывает финальная функция*/
    let gameTurnsCount = 0;
    let totalTime = '';
    let localStorageArray = [];

    /*раунд игры*/
    function reverseCards() {
        if (limit) {/*если лимит в 2 перевернутые карты за раунд исчерпан - конец раунда*/
            return;
        }
        if (this === firstCard) {
            return;
        }
        /*запуск счетчика времени с кликом по первой карте в игре*/
        if (!hasReverse && scoreCount === 0 && penaltyCount === 0) {
            timeCount();
        }
        this.classList.add('reverse-card'); /*добавляем класс карте, на которой произошел клик*/
        if (!hasReverse) {
            hasReverse = true;
            firstCard = this;
            return;
        }
        secondCard = this;
        checkForMatch();
    }

    /*Ведем счет за совпавшие пары, добавляем значение в блок score*/
    const keepScore = () => {
        scoreCount += 30;
        scoreBlock.innerHTML = `${scoreCount}`;
    }

    /*Ведем счет за несовпавшие пары, добавляем значение в блок penalty*/
    const keepPenalty = () => {
        penaltyCount++;
        penaltyBlock.innerHTML = `${penaltyCount}`;
    }

    /*Счетчик времени*/
    const timeCount = () => {
        timerId = setInterval(() => {
            timeInterval++;
            seconds = timeInterval;
            if (timeInterval > 59) {
                seconds = 0;
                timeInterval = 0;
                minutes++;
            }
            minutesValue = minutes;
            secondsValue = seconds;
            if (seconds < 10) {
                secondsValue = `0${seconds}`;
            }
            if (minutes < 10) {
                minutesValue = `0${minutes}`;
            }
            time = `${minutesValue}:${secondsValue}`
            timeBlock.innerHTML = time;
        }, 1000)
    }

    /*Если пара совпала, оставляем эти карты открытыми, заносим в счет очков 30 баллов, 
    снимаем с карт событие клик, раунд закончен. Если пара не совпала, закрываем эти карты, 
    заносим в счет пенальти 1 очко, снимаем с карт событие клик, раунд закончен*/
    const checkForMatch = () => {
        if (firstCard.dataset.character === secondCard.dataset.character) {
            keepScore();
            cardPairCount++;
            if (cardPairCount === 10) {
                finalGame();
            }
            turnCards();
            return;
        } else {
            keepPenalty();
            unfoldCards();
        }
    }

    /*Для совпавшей пары карт снимаем событие клик, оставляем их открытими*/
    const turnCards = () => {
        firstCard.removeEventListener('click', reverseCards);
        secondCard.removeEventListener('click', reverseCards);
        backCards();
    }

    /*Для несовпавшей пары переворачиваем эти карты с паузой 1500 миллисекунд (1,5секунды), 
    снимая с них клас "reverse-card"*/
    const unfoldCards = () => {
        limit = true;
        setTimeout(() => {
            firstCard.classList.remove('reverse-card');
            secondCard.classList.remove('reverse-card');
            backCards();
        }, 1000);
    }

    /*Обнуляем значения с конце каждого раунда*/
    const backCards = () => {
        hasReverse = false;
        limit = false;
        firstCard = null;
        secondCard = null;
    }

    /*Перемешиваем карты при помощи добавления случайного значения "order" 
    для каждого элемента грид-сетки*/
    const shuffle = () => {
        memoryCards.forEach(card => {
            let ramdomPos = Math.floor(Math.random() * 20);
            card.style.order = ramdomPos;
        });
    };
    shuffle();

    const finalGame = () => {
        totalScore = totalScore + (scoreCount - penaltyCount);
        if (scoreCount < penaltyCount) {
            totalScore = 0;
        }
        totalScoreBlock.innerHTML = `${totalScore}`;
        /*находим общее количество ходов за игру*/
        gameTurnsCount = penaltyCount + (scoreCount / 30);
        totalTime = `${minutesValue}:${minutesValue}`;
        setTimeout(() => {
            clearInterval(timerId);
        }, 0);
        showTotalResult();
        if (localStorageArray.length === 10 && localStorageArray.length !== 0) {
            localStorageArray.shift();
            localStorageArray.push({ time: `${time}`, total: `${totalScore}` })
        } else {
            localStorageArray.push({ time: `${time}`, total: `${totalScore}` })
        }
        setLocalStorage();
    }

    /*Появление блока с результатами в финале игры*/
    const showTotalResult = () => {
        totalGameTime.innerHTML = time;
        totalGameScore.innerHTML = `${totalScore}`;
        totalGameMoves.innerHTML = `${gameTurnsCount}`;
        setTimeout(() => {
            totalGameBlock.classList.add('active');
        }, 1000);
    }

    /*Закрытие блока с финальными результатами при нажатии на крест*/
    totalGameCloseButton.addEventListener('click', () => {
        totalGameBlock.classList.remove('active')
    });

    /*Перезагрузка игры по клику на кнопку Играть ещё*/
    const playAgain = () => {
        cardPairCount = 0;
        scoreCount = 0;
        scoreBlock.innerHTML = `${scoreCount}`;
        penaltyCount = 0;
        penaltyBlock.innerHTML = `${penaltyCount}`;
        totalScore = 0;
        totalScoreBlock.innerHTML = `${totalScore}`;
        setTimeout(() => {
            clearInterval(timerId);
        }, 0);
        timeInterval = 0;
        seconds = 0;
        minutes = 0;
        minutesValue = minutes;
        secondsValue = seconds;
        if (seconds < 10) {
            secondsValue = `0${seconds}`;
        }
        if (minutes < 10) {
            minutesValue = `0${minutes}`;
        }
        timeBlock.innerHTML = `${minutesValue}:${minutesValue}`;
        memoryCards.forEach(card => {
            if (card.classList.contains("reverse-card")) {
                card.classList.remove("reverse-card");
            }
            card.addEventListener('click', reverseCards);
        });
        shuffle();
    }
    playAgainButton.addEventListener('click', playAgain);

    /*запуск раунда по клику на карту*/
    memoryCards.forEach(card => card.addEventListener('click', reverseCards));

    /*Сохранение результатов в LocalStorage*/
    const setLocalStorage = () => {
        localStorage.setItem('localStorageArray', JSON.stringify(localStorageArray));
    }
    window.addEventListener('beforeunload', setLocalStorage);

    const getLocalStorage = () => {
        if (localStorage.getItem('localStorageArray')) {
            localStorageArray = JSON.parse(localStorage.getItem("localStorageArray"));
        }
    }
    window.addEventListener('load', getLocalStorage);

    /*Записываем информацию из массива LocalstorageArray в таблицу результатов*/
    const fillResultTable = () => {
        getLocalStorage;
        let i = 0;
        while (i < localStorageArray.length) {
            resultTableScore[i].innerHTML = `${localStorageArray[i]['total']}`;
            resultTableTime[i].innerHTML = `${localStorageArray[i]['time']}`;
            i++;
        }
    }
    resultTableButton.addEventListener('click', () => {
        fillResultTable();
        resultTableContainer.classList.add("active");
    })

    resultTableCloseButton.addEventListener('click', () => {
        resultTableContainer.classList.remove("active");
    })

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape' && resultTableContainer.classList.contains("active")) {
            resultTableContainer.classList.remove("active");
        }
    });


    /*Звук в игре*/
    const volumeButton = document.querySelector('.header-volume-button');
    const gameSound = new Audio();
    gameSound.src = 'assets/New_Pork_City.mp3';
    gameSound.autoplay = true;
    gameSound.loop = true;
    gameSound.volume = 0;

    const gameMute = () => {
        if (gameSound.volume === 0) {
            gameSound.play();
            gameSound.volume = 50 / 100;
            volumeButton.classList.remove("mute");
        } else {
            gameSound.pause();
            gameSound.volume = 0;
            volumeButton.classList.add("mute");
        }
    }
    volumeButton.addEventListener('click', gameMute);


    console.log(`
    Самооценка: 70 баллов
        Вёрстка +10: 
            - реализован интерфейс игры +5
            - в футере приложения есть ссылка на гитхаб автора приложения, год создания приложения, логотип курса со cсылкой на курс +5
        Логика игры. Карточки, по которым кликнул игрок, переворачиваются согласно правилам игры +10
        Игра завершается, когда открыты все карточки +10
        По окончанию игры выводится её результат - количество ходов, которые понадобились для завершения игры +10
        Результаты последних 10 игр сохраняются в local storage. Есть таблица рекордов, в которой сохраняются результаты предыдущих 10 игр +10
        По клику на карточку – она переворачивается плавно, если пара не совпадает – обе карточки так же плавно переварачиваются рубашкой вверх +10
        Очень высокое качество оформления приложения и/или дополнительный не предусмотренный в задании функционал, улучшающий качество приложения +10:
            - Добавлена музыка, есть возможность выключить и влючить звук игры. 
            - Добавлена кнопка "Играть ещё", которая перезагружает игру, сохраняя предыдущие результаты в таблицу рекордов
            - Добавлен счет совпадений и штрафов
    `);

















});

