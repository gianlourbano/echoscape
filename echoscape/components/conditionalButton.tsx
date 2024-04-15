


import React from 'react';

interface MyComponentProps {
  Button1: React.ReactElement; // Changed from ReactNode to ReactElement to allow cloneElement
  Button2: React.ReactElement; // Changed from ReactNode to ReactElement to allow cloneElement
  showButton1: boolean;
  setShowButton1: (value: boolean) => void;
}

export default function ConditionalButton({Button1, Button2, showButton1, setShowButton1} : MyComponentProps) {
  const Button1WithHandler = React.cloneElement(Button1, {
    onPress: () => {
      if (Button1.props.onPress) {
        Button1.props.onPress();
      }
      setShowButton1(false);
    },
  });

  const Button2WithHandler = React.cloneElement(Button2, {
    onPress: () => {
      if (Button2.props.onPress) {
        Button2.props.onPress();
      }
      setShowButton1(true);
    },
  });

  return (
    <>
      { showButton1 ? Button1WithHandler : Button2WithHandler }
    </>
  );
};