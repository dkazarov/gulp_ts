// import burger from './js-components/burger';

// burger();
const burger = document.querySelector('.burger');
const burgerLine = document.querySelector('.burger__line');

burger.addEventListener('click', () => {
	burgerLine.classList.toggle('line--hide');
	burger.classList.toggle('burger--transform');
});

console.log(burger);
