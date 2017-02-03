import React, { PropTypes, Component } from 'react'
import { WebView, View } from 'react-native'

class AuthWebView extends Component {

  static propTypes = {
    url         : PropTypes.string,
    visible     : PropTypes.bool,
    onNavChange : PropTypes.func
  }

  static defaultProps = {
    javaScriptEnabled  : true,
    contentInsets      : true,
    domStorageEnabled  : true,
    startInLoadingState: true,
    scalesPageToFit    : true
  }

  _onShouldStartLoadWithRequest = (event) => {
    return true;
  }

  _onLoadEnd = ({ nativeEvent }) => {
    this.props.onNavChange(nativeEvent.url)
  }

  renderContent() {
    const { 
      javaScriptEnabled, contentInsets, domStorageEnabled, startInLoadingState, scalesPageToFit, url, dimensions: { width } 
    } = this.props

    const flexWidth = width ? { flexBasis: width } : {};
    
    return (
      <View style={[styles.container, flexWidth]}>
        <WebView
          automaticallyAdjustContentInsets={contentInsets}
          source={{uri: url}}
          javaScriptEnabled={javaScriptEnabled}
          domStorageEnabled={domStorageEnabled}
          decelerationRate='normal'
          onNavigationStateChange={this._onNavigationStateChange}
          onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest}
          startInLoadingState={startInLoadingState}
          scalesPageToFit={scalesPageToFit}
          onLoadEnd={this._onLoadEnd}
        />         
      </View>
    )
  }

  render() {
    return this.props.visible ? this.renderContent() : null;
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    flexGrow: 1, 
    marginTop: 20
  }
}

export default AuthWebView
