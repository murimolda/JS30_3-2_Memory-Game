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
    let hasReverse = false; /*перевернута ли карта*/
    let firstCard; /*первая выбранная карта*/
    let secondCard; /*вторая выбранная карта*/
    let limit = false; /*лимит в две карты*/
    let scoreCount = 0; /*счет совпавших пар, 30 очков за каждую*/
    let penaltyCount = 0; /*счет несовпавших пар, 1 очко за каждую*/
    let totalScore = 0; /*общий счет за игру, из расчета scoreCount - penaltyCount,
    если счет пенальти будет больше счета за пары - общий счет равняется 0*/
    const scoreBlock = document.querySelector('.result-score');
    const penaltyBlock = document.querySelector('.result-penalty');
    const totalScoreBlock = document.querySelector('.result-total');
    const timeBlock = document.querySelector('.result-time');
    let timeInterval = 0; /*счетчик секунд*/
    let timerId; /*переменная, содержащая setInterval, 
    для остановки времени на финале игры и вывода общего времение игры*/
    let seconds = 0;
    let minutes = 0;
    let minutesValue;
    let secondsValue;
    let cardPairCount = 0; /*количество совпавший пар. Когда достигает 10, срабатывает финальная функция*/
    let gameTurnsCount = 0;
    const playAgainButton = document.querySelector('.memory-play-again');


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
            timeBlock.innerHTML = `${minutesValue}:${secondsValue}`;
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
        }, 1500);
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
    // shuffle();

    const finalGame = () => {
        totalScore = totalScore + (scoreCount - penaltyCount);
        totalScoreBlock.innerHTML = `${totalScore}`;
        /*находим общее количество ходов за игру*/
        gameTurnsCount = penaltyCount + (scoreCount / 30);
        setTimeout(() => {
            clearInterval(timerId);
        }, 0);
    }

    /*запуск раунда по клику на карту*/
    memoryCards.forEach(card => card.addEventListener('click', reverseCards));

    const playAgain = () => {
        scoreCount = 0;
        scoreBlock.innerHTML = `${scoreCount}`;
        penaltyCount = 0;
        penaltyBlock.innerHTML = `${penaltyCount}`;
        setTimeout(() => {
            clearInterval(timerId);
        }, 0);
        timeInterval = 0;
        seconds = 0;
        minutes = 0;
        timeBlock.innerHTML = `${minutesValue}:${minutesValue}`;
        memoryCards.forEach(card => {
            if (card.classList.contains("reverse-card")) {
                card.classList.remove("reverse-card");
            }
            card.addEventListener('click', reverseCards);
        });
    }

    playAgainButton.addEventListener('click', playAgain);














});

