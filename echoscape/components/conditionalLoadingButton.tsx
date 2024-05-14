


import React from 'react';



interface ConditionalPlaceholderButtonProps {
  Button1: React.ReactElement;
  Button2: React.ReactElement;
  showButton1: boolean;
  setShowButton1: (value: boolean) => void;
  Placeholder: React.ReactElement;
  showPlaceholder: boolean;
}


/*
when you have
button1 -> sends request (example: subscribe)
placeholder -> loading / waiting for response
button2 -> sends related request (example: unsubscribe)
*/
export default function ConditionalPlaceholderButton({
  Button1,
  Button2,
  showButton1,
  setShowButton1,
  Placeholder,
  showPlaceholder,
}: ConditionalPlaceholderButtonProps) {
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

  if (showPlaceholder) {
    return <>{Placeholder}</>;
  } else {
    return <>{showButton1 ? Button1WithHandler : Button2WithHandler}</>;
  }
}