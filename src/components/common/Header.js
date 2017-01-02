import React, { PropTypes } from 'react'
import { View, Text } from 'react-native'

const Header = ({ title }) => {
  const { textStyle, viewStyle } = styles;
  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{title}</Text>
    </View>
  );
}

Header.propTypes = {
  title: PropTypes.string
};

const styles = {
  textStyle: {
    fontSize: 20
  },
  viewStyle: {
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    elevation: 2,
    position: 'relative'
  }
};

export { Header };
