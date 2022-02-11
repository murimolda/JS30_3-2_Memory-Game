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

    /*Раскрытие/закрытие карт*/
    const memoryCards = document.querySelectorAll('.memory-card');
    let hasReverse = false;
    let firstCard;
    let secondCard;
    let limit = false;

    function reverseCards() {
        if (limit) {
            return;
        }
        if (this === firstCard) {
            return;
        }
        this.classList.add('reverse-card');
        if (!hasReverse) {
            hasReverse = true;
            firstCard = this;
            return;
        }
        secondCard = this;
        checkForMatch();
    }

    const checkForMatch = () => {
        if (firstCard.dataset.character === secondCard.dataset.character) {
            turnCards();
            return;
        } else {
            unfoldCards();
        }
    }

    const turnCards = () => {
        firstCard.removeEventListener('click', reverseCards);
        secondCard.removeEventListener('click', reverseCards);
        backCards();
    }

    const unfoldCards = () => {
        limit = true;
        setTimeout(() => {
            firstCard.classList.remove('reverse-card');
            secondCard.classList.remove('reverse-card');
            backCards();
        }, 1500);
    }

    const backCards = () => {
        hasReverse = false;
        limit = false;
        firstCard = null;
        secondCard = null;
    }

    memoryCards.forEach(card => card.addEventListener('click', reverseCards));















});

