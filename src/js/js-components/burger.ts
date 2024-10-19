const burger = document.querySelector('.burger');
const burgerLine = document.querySelector('.burger__line');

const burgerClick = (): void => {
	burger.addEventListener('click', () => {
		burgerLine.classList.toggle('line--hide');
		burger.classList.toggle('burger--transform');
	});
};

export default burgerClick;
