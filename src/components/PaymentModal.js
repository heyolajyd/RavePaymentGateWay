import React, { Component, PropTypes } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { 
  TouchableHighlight, View, Modal, Text, TextInput, StyleSheet, Image, Linking, WebView, Dimensions
} from 'react-native'

import CardDetailsForm from './partials/CardDetailsForm'
import TokenForm from './partials/TokenForm'
import AuthWebView from './partials/AuthWebView'
import { Section, Button, Input, FadeOutView, Select, CheckBox } from './common'

import RaveApi from '../actions/RaveApi'

import { 
  SUCCESS, NEED_TO_VALIDATE, VBVSECURECODE, PIN, RANDOM_DEBIT, AVS, CARD, ACCOUNT, VALIDATION, selData,
  selChargeRespAction, selAuthModel, selAuthUrl, selTxnRef, selPaymentTypeTxnMessage, selFormTypeFields, 
  selValidationBtnLabel, selTransaction, selValRespAction, selUserToken, selValDetails, selPaymentType, 
  isAuthSuggested, isToken, isEmbedToken, isRememberMe,  isUseToken, USE_EMBED_TOKEN, USE_TOKEN, selEmbeddedToken
} from '../selector'

import { getQueryParams, formatCurrencyAmountLabel } from '../utils'

const dimensions = Dimensions.get('window')

class PaymentModal extends Component {  
  constructor(props) {
    super(props)

    this.state = this._calculateState()
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleCheckBox = this._handleCheckBox.bind(this)
    
  }
  
  componentWillMount() {
    RaveApi.getAllBanks()
    .then(res => {
      this.setState({ banks: res.data })
    })
    .catch(err => {
      throw err
    })
  }

  componentDidMount() {
    RaveApi.getEmbeddedToken().then((embedToken) => {
      this.setState({ embedToken });
    }).done();
  }  
  
  _calculateState() {
    return {
      cardDetails: {},
      accountDetails: {
        accountnumber: null,
        accountbank: null,
        validateoption: null
      },
      validateDetails: {},      
      banks: [],
      validateOption : [
        { code: 'USSD', name: 'USSD'},
        { code: 'HWTOKEN', name: 'HWTOKEN'}
      ],
      tabs: [CARD, ACCOUNT],
      currentTab: CARD,
      loading: false,
      errorMessage: null,
      transactionError: false,
      transactionInfo: false,
      transactionMsg: null,
      chkGrpValue: null,
      isAccountValidation: false,
      needsValidation: false,
      authModel: null,
      authUrl: null,
      token: null
    }
  }
  
  _handleSuccessfulPayment(res) {
    return (selChargeRespAction(res.data) === SUCCESS)
    ? this._handleTxnComplete(res.data)
    : this._handleValidateTxn(res.data)
  }

  _handleSuccessfulValidation(res) {
    const { data } = res;
    const { currentTab } = this.state

    return (selValRespAction({ ...data, currentTab }) === SUCCESS)
    ? this._handleTxnComplete(res.data)
    : this._handleFailedPayment(res.message)
  }

  _handleTxnComplete(data) {
    const { chkGrpValue, currentTab } = this.state
    const token = selUserToken(data)
    const embedToken = selEmbeddedToken(data)

    let transactionMsg = selPaymentTypeTxnMessage(data)
    
    if (isRememberMe(chkGrpValue) && currentTab === CARD) {
      transactionMsg = this._getTransactionTokenMessage(token)
    }

    this.setState({
      token,
      transactionMsg,
      loading: false,
      transactionInfo: true
    }, this._handleEmbedToken(embedToken))    
  }

  _handleValidateTxn(data) {
    const needsValidation = (selChargeRespAction(data) == NEED_TO_VALIDATE)
    const isSuggestedAuth = isAuthSuggested(data)

    const authModel = selAuthModel(data)
    const authUrl = selAuthUrl(data)
    const token = selUserToken(data)
    const embedToken = selEmbeddedToken(data)
    const validateDetails = selValDetails(data)

    const isAccountValidation = data.paymentType === ACCOUNT.toLowerCase()

    this.setState({ 
      needsValidation,
      token,  
      validateDetails,
      authUrl,
      isSuggestedAuth,
      authModel: (isAccountValidation ? ACCOUNT : authModel),
      authView: (authModel === VBVSECURECODE),
      loading: false 
    }, this._handleEmbedToken(embedToken))
  }
  
  _handleFailedPayment(error) {
    this.setState({ 
      loading: false, 
      transactionError: true,
      errorMessage: error
    })
  }

  _handleEmbedToken(value) {
    RaveApi.setEmbeddedToken(value)
  }

  _processCharge() {
    const { props, state } = this
    const transaction = selTransaction({ ...state, ...selData(props) })
    return transaction
    .then(res => this._handleSuccessfulPayment(res))
    .catch(err => this._handleFailedPayment(err))    
  }

  _processValidateCharge() {
    const { PBFPubKey } = this.props
    const { validateDetails, currentTab } = this.state
    return RaveApi.validateCharge({ ...validateDetails, PBFPubKey, currentTab })
    .then(res => this._handleSuccessfulValidation(res))
    .catch(err => this._handleFailedPayment(err)) 
  }
    
  _handlePaymentRequest = () => {
    const { needsValidation, isSuggestedAuth } = this.state

    this.setState({ loading: true })

    return !isSuggestedAuth && needsValidation
    ? this._processValidateCharge()
    : this._processCharge()
  }

  _getTransactionTokenMessage(token) {
    return token 
    ? (
      <Text>
        <Text>Transaction Successful. {'\n'}</Text>
        <Text>Use Token: {token} for future transactions.</Text>
      </Text>
    )
    : <Text>Transaction Successful!</Text>
  }

  _handleCloseModal() {
    this.setState(
      { ...this._calculateState()}, 
      this.props.onRequestClose()
    )
  }

  _handleCheckBox = (key) => {
    let { chkGrpValue } = this.state;

    chkGrpValue = chkGrpValue === key ? null : key;

    this.setState({ chkGrpValue })
  }
  
  _onSelectTab = (tab) => {
    return this.setState({ currentTab: tab, transactionMsg: null })
  }
  
  _onSelectChange(key, value) {
    const accountDetails = { ...this.state.accountDetails, [key]: value };
    this.setState({ accountDetails })    
  }
  
  _resetErrorNotification = () => {
    this.setState({ transactionError: false, errorMessage: null })
  }
  
  _resetInfoNotification = () => {
    this.setState({ transactionInfo: false })
  }

  _handleCardDetails(key, value) {
    const cardDetails = { ...this.state.cardDetails, [key]: value };
    this.setState({ cardDetails })
  }
  
  _handleAccountDetails(key, value) {
    const accountDetails = { ...this.state.accountDetails, [key]: value }
    this.setState({ accountDetails })    
  }

  _handleValidateDetails(key, value) {
    const validateDetails = { ...this.state.validateDetails, [key]: value }
    this.setState({ validateDetails })
  }

  _handleChange = (prop, key, value) => () => {
    const propVal = { ...this.state[prop], [key]: value }
    this.setState({ [prop]: propVal })
  }

  _handleNavChange = (url) => {
    const { chkGrpValue, token } = this.state;
    const isComplete = url.includes(RaveApi.RootUrl)

    const transactionMsg = isComplete && isRememberMe(chkGrpValue)
    ? this._getTransactionTokenMessage(token) 
    : decodeURI(getQueryParams(url).message);

    this.setState({ 
      transactionMsg,
      authView: !isComplete,
      transactionInfo: isComplete
    })
  }
  
  renderPaymentInfo() {
    const { description, title } = this.props
    return (
      <View style={styles.paymentSummary}>
        <Image style={styles.image} source={require('../assets/defaultLogo.jpg')}/>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentDescription}>{description}</Text>
        <Text style={styles.totalAmount}>{formatCurrencyAmountLabel(this.props)}</Text>
      </View>
    )  
  }
  
  renderPaymentTab() {
    const { tabs, currentTab } = this.state;
    return(
      <Section>
        {tabs.map(tab => {
          const activeTab = (currentTab === tab) ? styles.activeTab : {};
          return (
            <Text 
              key={tab} 
              onPress={this._onSelectTab.bind(this, tab)} 
              style={[styles.tab, activeTab]}>
              <Icon name={`${tab === CARD ? 'credit-card-alt' : 'university'}`}/>
              &emsp;{tab}
            </Text>
          )
        })}
      </Section>
    )
  }

  renderUseTokenCtrl() {
    const { chkGrpValue } = this.state;
    return (
      <Section>
        <View style={styles.useTokenContainer}>
          <CheckBox
            onChange={this._handleCheckBox.bind(this, 'useEmbedToken')}
            isChecked={isEmbedToken(chkGrpValue)}
            leftText={'Use Embed Token'}
          />        
          <CheckBox
            onChange={this._handleCheckBox.bind(this, 'useToken')}
            isChecked={isUseToken(chkGrpValue)}
            rightText={'Use Token'}
          />          
        </View>
      </Section>
    );
  }
  
  renderUseTokenForm() {
    return (
      <TokenForm 
        onInputChange={this._handleCardDetails.bind(this)}
        useEmbedToken={isEmbedToken(this.state.chkGrpValue)}
      />
    )
  }

  renderUseCardDetailsForm() {
    const { authModel } = this.props
    return (
      <CardDetailsForm
        authModel={authModel}
        onInputChange={this._handleCardDetails.bind(this)}
        onCheckBoxChange={this._handleCheckBox}
        rememberMe={isRememberMe(this.state.chkGrpValue)}
      />
    )
  }

  renderErrorNotification() {
    const { transactionError, errorMessage } = this.state
    return transactionError &&
      <FadeOutView callback={this._resetErrorNotification}>
        <Section>
          <View style={[styles.notification, styles.errorNotification]}>
            <Text style={styles.notificationText}>{errorMessage}</Text>
          </View>
        </Section>
      </FadeOutView>
  }

  renderInfoNotification() {
    const { transactionInfo, transactionMsg } = this.state
    return transactionInfo &&
      <Section>
        <View style={[styles.notification, styles.infoNotification]}>
          <Text style={styles.notificationText}>{transactionMsg}</Text>
        </View>
      </Section>
  }

  renderAuthWebView() {
    const { authUrl, authView } = this.state
    
    return (
      <AuthWebView 
        url={authUrl} 
        visible={authView}
        dimensions={dimensions}
        onNavChange={this._handleNavChange}
      />     
    )
  }

  renderValidationFormType() {
    const { authModel, validateDetails, isSuggestedAuth } = this.state
    const formFields = selFormTypeFields(this.state)
    return (
      <View>
        {formFields.map((fieldObj, key) => {
          const { field, placeholder, secureTextEntry } = fieldObj
          return (
            <Section key={key}>
              <Input
                ref={key}
                placeholder={placeholder}
                value={validateDetails[field]}
                onChangeText={ isSuggestedAuth 
                  ? this._handleCardDetails.bind(this, field)
                  : this._handleValidateDetails.bind(this, field)
                }
                maxLength={19}
                secureTextEntry={secureTextEntry}
              />
            </Section>
          )
        })}
      </View>
    )     
  }
  
  renderCardForm() {
    const { chkGrpValue, needsValidation } = this.state;

    return (
      <View>
        {needsValidation 
          ? this.renderValidationFormType()
          : (
            <View>
              {this.renderUseTokenCtrl()}
              {isToken(chkGrpValue)
                ? this.renderUseTokenForm()
                : this.renderUseCardDetailsForm()
              }
            </View>
          )
        }
      </View>
    )
  }
  
  renderAccountForm() {
    const { banks, validateOption, accountDetails: { accountnumber } } = this.state
    return (
      <View>
        <Section>
          <Input
            placeholder='Account Number'
            value={accountnumber}
            onChangeText={this._handleAccountDetails.bind(this, 'accountnumber')}
          />        
        </Section>
        <Section>
          <Select
            defaultLabel={'SELECT BANK'}
            options={banks}
            changeValue={this._handleAccountDetails.bind(this, 'accountbank')}
          />
        </Section>
        <Section>
          <Select
            defaultLabel={'SELECT OTP option'}
            options={validateOption}
            changeValue={this._handleAccountDetails.bind(this, 'validateoption')}
          />
        </Section>        
      </View>
    )
  }

  renderFormType() {
    const { currentTab, needsValidation } = this.state

    return needsValidation
    ? this.renderValidationFormType()
    : (currentTab === CARD 
      ? this.renderCardForm() 
      : this.renderAccountForm()
    )
  }

  renderButtonType() {
    const { needsValidation, loading } = this.state
    const label = needsValidation 
    ? selValidationBtnLabel(this.state) 
    : formatCurrencyAmountLabel(this.props)
    return (
      <Section>
        <Button
          labelText={label}
          onPress={this._handlePaymentRequest} 
          loading={loading}
          buttonStyle={styles.payButton}
          buttonTextStyle={styles.payButtonText}
          underlayColor='#127F6A'
        />
      </Section>
    )
  }
  
  renderContent() {
    const { currentTab, loading } = this.state
    return (
      <View>
        {this.renderFormType()}
        {this.renderButtonType()}
      </View>
    )
  }

  renderInfoContent() {
    const { transactionInfo, transactionMsg } = this.state
    return (
      <View>
        {this.renderInfoNotification()}
        <Section>
          <Button 
            labelText={'CLOSE FORM'}
            onPress={this._handleCloseModal}
            buttonStyle={styles.closeButton}
            buttonTextStyle={styles.closeButtonText}
            underlayColor='#C0C0C0'
          />
        </Section>
      </View>
    )
  }
  
  renderPaymentForm() {
    const { transactionMsg } = this.state
    return (
      <View style={[styles.parentSection, styles.paymentForm]}>
        <View style={styles.sectionContainer}>
          {this.renderPaymentTab()}
          {this.renderErrorNotification()}
          { transactionMsg 
            ? this.renderInfoContent() 
            : this.renderContent()
          }
        </View>
      </View>    
    )
  }
  
  renderCloseModalIcon() {
    return (
      <View style={styles.closeModalIconContainer}>
        <TouchableHighlight 
          onPress={this._handleCloseModal}
          underlayColor='transparent'>
          <View>
            <Text>
              <Icon name='times-circle' size={16} color='#DEDEDE'/>
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }

  render() {
    const { visible, transparent, onRequestClose } = this.props
    return (
      <Modal
        visible={visible}
        transparent={transparent}
        animationType='slide'
        onRequestClose={onRequestClose}>
        {this.state.authView 
          ? this.renderAuthWebView() 
          : <View style={styles.container}>
              <View style={styles.paymentContainer}>
                {this.renderCloseModalIcon()}
                {this.renderPaymentInfo()}
                {this.renderPaymentForm()}
              </View>
            </View>
        }
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  paymentContainer: {
    backgroundColor: '#FFF', 
    borderRadius: 5
  },
  parentSection: {
    flexDirection: 'row',
    padding: 15
  },
  sectionContainer: {
    flex:1, 
    flexDirection: 'column'
  },
  paymentForm: {
    backgroundColor: '#FBFBFB',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderTopColor: '#DDD',
    borderTopWidth: 1
  },
  paymentSummary: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15
  },
  inputContainer: {
    flex: 1,
    height: 36
  },
  spacing: {
    marginLeft: 12
  },
  totalAmount: {
    color: '#16A085',
    fontSize: 18
  },
  paymentDescription: {
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    textAlign: 'center'
  },
  paymentTitle: {
    marginTop: 15,
    fontWeight: '500',
    fontSize: 16
  },
  image: {
    height: 50,
    borderRadius: 25,
    width: 50
  },
  tabContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    height: 46 
  },
  tab: {
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFF',
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    textAlign: 'center'
  },
  activeTab: {
    borderColor: '#372E4C',
    backgroundColor: '#372E4C',
    color: '#FFF'
  },
  notification: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'    
  },
  errorNotification: {
    backgroundColor: '#C0392B'
  },
  infoNotification: {
    backgroundColor: '#2980b9'
  },
  notificationText: {
    textAlign: 'center',
    color: '#FFF'
  },
  payButton: {
    backgroundColor: '#16A085',
    borderColor: '#16A085'    
  },
  payButtonText: {
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0'    
  },
  closeButtonText: {
    color: 'black',
    fontWeight: '400'
  },
  closeModalIconContainer: {
    alignItems: 'flex-end',
    right: 8,
    top: 8
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  useTokenContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  tokenNotification: {
    flex: 1,
    flexDirection: 'row'
  }
})

PaymentModal.propTypes = {
  visible        : PropTypes.bool,
  amount         : PropTypes.number,
  description    : PropTypes.string,
  transparent    : PropTypes.bool,
  onRequestClose : PropTypes.func
}

PaymentModal.defaultProps = {
  transparent: true,
  country    : 'Nigeria',
  currency   : 'NGN'
}

export default PaymentModal
