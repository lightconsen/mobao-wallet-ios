declare var require: any;
/// <reference path="../../typings/call.d.ts"/>
import { HttpClient } from "@angular/common/http";
import { Component, NgZone } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from "@ionic/storage";
import decoder from 'abi-decoder';
import { AlertController, IonicPage, MenuController, NavController, NavParams, Platform } from 'ionic-angular';
import { Md5 } from 'ts-md5/dist/md5';
import { AppConfig } from '../../app/app.config';
import { WalletProvider } from '../../providers/wallet';
let moac = require('../../api/mobaolib');
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
// var vConsole = new VConsole();

// let cordova = require('cordova');
/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-news',
    templateUrl: 'news.html',
})
export class NewsPage extends BaseUI {
    tabs: string = 'pass';
    appInstance: any;//打开的浏览器对象
    appEventData: any;
    user: any = {};
    dappList: any = [];//dapp列表
    enterFlag: boolean = false;//进入的弹框 true为显示
    signFlag: boolean = false;//签名的弹框 true为显示
    item: any = {};//列表某一条
    paramsSign: any = {}; //要签名的消息
    secret: string = '';//签名所需私钥
    secretPwd: string = '';//解密私钥的密码
    operate: string = ''//MOAC交易 ||  合约操作
    dappName: string = '';//当前打开的dapp的名称
    name: string = '';//data返回的方法名
    params:any;//解析的data返回的
    paramsJSON:any;//解析的data转字符串
    tokens: any; //请求后台的tokens
    networkVersion:any;//注入用的
    sendResult1:any;//存本地交易记录用的
    amount:any;//本地存交易记录用的数量
    constructor(
        public translate: TranslateService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public plt: Platform,
        public alertCtrl: AlertController,
        private storage: Storage,
        private http: HttpClient,
        private zone: NgZone,
        public menuCtrl: MenuController,
        public walletProvider: WalletProvider,
        private socialSharing: SocialSharing, ) {
            super();
        this.getDappList();
        this.getTokens();
    }
    ionViewWillEnter(){
        this.getDappList();
        this.storage.get('user').then((user) => {
            if (user) {
                this.user = user;
            }
        })
        this.walletProvider.chain3_clientVersion({}).then((res)=>{
            this.networkVersion = res;
            console.log(this.networkVersion)
         })
    }
    getDappList() {//获取dapp列表
        this.http
            .get("https://mobao.halobtc.com/api/dapps", {})
            .subscribe(
                data => {
                    // console.log('data',typeof(data.data));
                    // let res = JSON.parse(data)
                    let res = JSON.stringify(data);
                    let res1 = JSON.parse(res);
                    this.dappList = res1.data;
                    console.log(res1)
                }
            );
    }
    getTokens() {//获取tokens
        this.http
            .get("https://mobao.halobtc.com/api/tokens", {})
            .subscribe(
                data => {
                    // console.log('data',typeof(data.data));
                    // let res = JSON.parse(data)
                    let res = JSON.stringify(data);
                    let res1 = JSON.parse(res);
                    this.tokens = res1;
                }
            );
    }
    enterCancel() {//取消
        this.enterFlag = false;
        let elements = document.querySelectorAll(".tabbar");
        if (elements != null) {
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'flex';
            });
        }
    }
    willEnter(item) {//点击列表某一个 弹确定进入的框
        this.item = item;
        this.dappName = item.name;
        let elements = document.querySelectorAll(".tabbar");
        if (elements != null) {
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'none';
            });
        }
        this.enterFlag = true;
    }

    enter() {
        this.enterCancel();

        //统计打开数量
        this.http
            .get("https://mobao.halobtc.com/api/dappcount/"+this.user.address+"/"+this.item.id+"/open", {})
            .subscribe(
                data => {
                    let res = JSON.stringify(data);
                    let res1 = JSON.parse(res);
                    console.log(res1)
                }
            );
            
        let that = this;
        this.appInstance = cordova.ThemeableBrowser.open(that.item.url || 'https://mobao.halobtc.com/dapp', '_blank', {
            statusbar: {
                color: '#ffffff'
            },
            toolbar: {
                height: 44,
                color: '#ffffff'
            },
            title: {
                color: '#000000',
                showPageTitle: true,
                staticText: this.item.name
            },
            customButtons: [
                {
                    image: 'share',
                    imagePressed: 'share_pressed',
                    align: 'right',
                    event: 'closePressed'
                },
                {
                    image: 'close',
                    imagePressed: 'close_pressed',
                    align: 'right',
                    event: 'sharePressed'
                }
            ],
            backButtonCanClose: false
        });
        this.appInstance.addEventListener('closePressed', function (e) {
            that.appInstance.close();
        });
        this.appInstance.addEventListener('sharePressed', function (e) {
            that.shareCB(e.url);
        });
        this.appInstance.addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
            // console.error(e.message);
        });
        this.appInstance.addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {
            console.log(e.message);
        });
        this.appInstance.addEventListener('loadstop', () => {
            let userAdd = that.user.address;
            // let networkVersion = that.walletProvider.chain3_clientVersion({});
            let script = moac.MLIB_FUNCTION(userAdd, this.networkVersion, {}, 'zh_cn');
            this.appInstance.executeScript({ code: script }, params => {});
        })

        this.appInstance.addEventListener('message', function (e) {
            console.log('-----------get message ---- ');
            console.log(e);
            that.appEventData = e.data;
            let type = e.data.type;
            let data = e.data.data;
            if (type === 'enable') {
                that.enable();
            } else if (type === 'sendAsync') {
                var method = data.method;
                var func = that.walletProvider[method];
                if ((method.indexOf('chain3_') === -1 && method.indexOf('mc_') === -1
                        && method.indexOf('net_') === -1 && method.indexOf('vnode_') == -1
                        && method.indexOf('scs_') === -1) || func === undefined) {
                    return that.doCallbackEvent(that.callbackData('fail', 'unknown method: ' + method, null));
                }

                if (method === 'mc_sendTransaction') {
                    that.sendTransaction(data.params);
                } else {
                    that.normalTransaction(method, data.params);
                }
            } else {
                that.doCallbackEvent(that.callbackData('fail', 'unknown request type: ' + type, null));
            }
        })
    }

    async normalTransaction(method, params) {
        try {
            let result = await this.walletProvider[method](params);
            if (result) {
                this.doCallbackEvent(this.callbackData('success', 'success', result));
            } else {
                this.doCallbackEvent(this.callbackData('fail', 'fail', null));
            }
        } catch (e) {
            this.doCallbackEvent(this.callbackData('fail', 'fail', e));
        }
    }

    isMoacTx(params, abi) {
        if (!abi) return true;
        decoder.addABI(abi);
        var p = decoder.decodeMethod(params.data);
        if (p === undefined) return true;
        return false;
    }

    async sendTransaction(params) {//签名弹框
        this.appInstance.hide();
        let elements = document.querySelectorAll(".tabbar");
        if (elements != null) {
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'none';
            });
        }
        this.zone.run(() => {
            this.signFlag = true;
        });
        let params1 = params[0];
        let abi:any = null;
        if(this.item.abi){
            abi = JSON.parse(this.item.abi) || null;
        }
        if (this.isMoacTx(params1, abi)) {
            this.paramsSign = params1;
            this.name = '';
            if(!params1.from){
                params1.from = this.user.address;
            }
            if(params1.from !== this.user.address){
                //错误提示
                this.zone.run(() => {
                    this.signFlag = false;
                });
                return this.doCallbackEvent(this.callbackData('fail', 'from address should consistent with current address in mobao wallet', null));
            }
            this.params = [{
                "name":"from",
                "value":params1.from.slice(0,10)+'...'+params1.from.slice(-10)
            },{
                "name":"to",
                "value":params1.to.slice(0,10)+'...'+params1.to.slice(-10)
            },{
                "name":"value",
                "value": this.walletProvider.fromvalue(params1.value)
            }];
        }else{
            decoder.addABI(abi);
            let paramsRes = decoder.decodeMethod(params1.data);
            this.name = paramsRes.name;
            let list:any = [];
            let list1:any = [];
            let List = paramsRes.params;
            for(let key in List){
                list.push(List[key])
                console.log('list',list)
            }
            for(let item in list){
                list1.push({
                    "name":((list[item].name.indexOf('_')) > -1)?list[item].name.slice(1):list[item].name,
                    "value":(list[item].value.length >30)?(list[item].value.slice(0,10)+'...'+list[item].value.slice(-10)):list[item].value
                })
            }
            this.paramsSign = params1;
            this.params = list1;
        }
        this.storage.get('pockets').then((p) => {
            if (p) {
                for (let key in p) {
                    if (p[key].address == params[0].from) {
                        this.secret = p[key].secret;
                        this.secretPwd = p[key].pwd;
                    }
                }
            }
        })
    }
    cancelSign() { //签名取消
        this.appInstance.show();
        this.signFlag = false;
        let elements = document.querySelectorAll(".tabbar");
        if (elements != null) {
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'flex';
            });
        }
    }
    signPwd() {//签名校验密码
        let prompt = this.alertCtrl.create({
            title: this.getResult("assets.8"),
            inputs: [
                {
                    type: 'password',
                    name: 'password',
                    placeholder: this.getResult("assets.8"),
                },
            ],
            buttons: [
                {
                    text: this.getResult("assets.9"),
                    handler: data => {
                        this.cancelSign();
                    }
                },
                {
                    text: this.getResult("assets.10"),
                    handler: data => {
                        if (Md5.hashStr(data.password) == this.secretPwd) {
                            this.sign();
                            this.signFlag = false;
                            let elements=document.querySelectorAll(".tabbar");
                            if(elements != null){
                                Object.keys(elements).map((key) => {
                                    elements[key].style.display = 'flex';
                                });
                            }

                            //统计支付数量
                            this.http
                                .get("https://mobao.halobtc.com/api/dappcount/"+this.user.address+"/"+this.item.id+"/pay", {})
                                .subscribe(
                                    data => {
                                        let res = JSON.stringify(data);
                                        let res1 = JSON.parse(res);
                                        console.log(res1)
                                    }
                                );

                        } else {
                            alert(this.getResult("assets.13"));
                        }
                    }
                }
            ]
        });
        prompt.present();
    }
    async sign() {//签名
        this.signFlag = false;
        this.appInstance.show();
        try {
            var secret0 = AppConfig.secretDec('call', this.secretPwd, this.secret);
            let result = await this.walletProvider.mc_sendTransaction(this.paramsSign, secret0);
            if(result){
                let sendResult1 = await this.walletProvider.mc_getTransactionByHash([result.result]);
                this.sendResult1 = sendResult1.result;
                if(this.item.abi){
                    let hash = result.result;
                    let txs = await this.walletProvider.mc_getTransactionReceipt([hash]);
                    let tx = await this.walletProvider.mc_getTransactionByHash([hash]);
                    let data = tx.result.input;
                    let heyu = txs.result.contractAddress;
                    const ContractStruct =await this.walletProvider.mc(this.item.abi);
                    let tokenData = ContractStruct.at(heyu);
                    let amount = parseInt(data.substring(74), 16) / Math.pow(10, tokenData.decimals());
                    alert('amount'+amount);
                }
                this.storage.get('record').then((R)=>{
                    if(R){
                        let record = this.sendResult1;
                        record.timestamp = new Date().getTime()/1000;
                        record.amount = this.amount;  
                        this.sendResult1 = R;
                        if(this.sendResult1.length>100){
                            this.sendResult1.shift().push(record);
                        }else{
                            this.sendResult1.push(record);
                        }
                        this.storage.set('record',this.sendResult1);
                    }else{
                        this.sendResult1.timestamp = new Date().getTime()/1000;
                        this.sendResult1.amount = this.amount;
                        this.storage.set('record',[this.sendResult1]);
                    }
                })
                return this.doCallbackEvent(this.callbackData('success', 'success', result));
            }else{
                return this.doCallbackEvent(this.callbackData('fail', 'fail', null));
            }
        } catch (e) {
            return this.doCallbackEvent(this.callbackData('fail', 'fail', e));
        }
    }
    
    doCallbackEvent(data) {
        console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
        // alert('do callback event- ' + JSON.stringify(this.appEventData))
        if (this.appEventData && this.appEventData.callback) {
            try {
                let cb = this.appEventData.callback
                let d = JSON.stringify(data)
                let code = `moac.callback("${cb}",${d})`
                console.log('===============callback------event---')
                this.appInstance.executeScript({ code: code }, params => { })
            } catch (err) {
                console.error(err)
            }
        }
    }

    callbackData(code, message, data) {
        return { code, message, data }
    }

    enable() {
        let pockets: any = [];
        this.storage.get('pockets').then((p) => {
            if (p) {
                for (let key in p) {
                    pockets.push(p[key].address);
                }
            }
            this.doCallbackEvent(this.callbackData('success', 'success', pockets));
        })
    }

    shareCB(url) {
        let options = {
            subject: 'share',
            url: url,
            chooserTitle: this.getResult("news.1")
        }
        this.socialSharing.shareWithOptions(options);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad NewsPage');
    }
    getResult(msg){
        return super.getI18n(msg,this.translate)
    }
}
