// Desc: This file contains the function to render the icon based on the type of pet
const RenderIcon = () => {
  const geticon = type => {
    switch (type) {
      case 'Dog':
        return "dog";
      case 'Cat':
        return "cat";
      case 'Bird':
        return "bird";
      case 'Snake':
        return "snake";
      case 'Fish':
        return "fish";
      case 'Rabbit':
        return "rabbit";
      case 'Turtle':
        return "turtle";
      case 'Fish':
        return "fish";
      default:
        return "paw" ;
    }
  };
  return {
    geticon,
  };
};
export default RenderIcon;
