import React from 'react';
import { View } from 'react-native';

const Card = (props) => {
  const { container } = styles;
  const { children } = props;
  return <View style={container}>{children}</View>;
};
 
const styles = {
  container: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#DDD',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10
  }, 
};

export { Card };