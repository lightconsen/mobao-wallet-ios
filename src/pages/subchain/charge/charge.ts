import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController
} from "ionic-angular";
import { WalletProvider } from "../../../providers/wallet";
import { Storage } from "@ionic/storage";
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from "../../../app/app.config";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the ChargePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-charge",
  templateUrl: "charge.html"
})
export class ChargePage extends BaseUI {
  @ViewChild('pwdID') myInput;
  info: any; //路由传过来的参数
  user: any;
  amount: any; //充币金额
  pwd: any = ""; //密码pwd1: string; //密码
  authorizeVal: any; //授权余额
  amountReg: any = /(^[0-9]*(.[0-9]+)?)$/;
  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {
    super();
    this.storage.get("user").then(user => {
      this.user = user;
    });
    this.info = this.navParams.get("info");
    this.authorizeVal = this.navParams.get("authorizeVal");
    console.log(this.info);
  }
  //点击确定  判断授权额度是否够
  toAuthorize() {
    if (!this.amount || !this.amountReg.test(this.amount)) {
      this.errorMsg(this.getResult('subchain.34'));
      return;
    }
    if (this.info.is_token && this.authorizeVal < this.amount) { //额度不够
      this.errorMsg(this.getResult('subchain.16'));
      this.navCtrl.pop();
      return
    } else {
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
            }
          },
          {
            text: this.getResult("assets.10"),
            handler: data => {
              this.pwd = data.password;
              this.buyMintToken();
            }
          }
        ]
      });
      prompt.present();
    }

  }

  //子链充值
  async buyMintToken() {
    // this.getAllowance();
    if (Md5.hashStr(this.pwd) != this.user.pwd) {
      this.errorMsg(this.getResult('assets.13'));
      return
    }
    let res: any;
    let secret = AppConfig.secretDec('call', this.user.pwd, this.user.secret) || AppConfig.secretDec('call', '123456', this.user.secret);
    if (this.info.is_token) {//合约子链
      res = await this.walletProvider.buyMintToken(
        secret,
        this.info.erc20_address,
        this.info.MicroChain,
        this.amount
      );
    } else {//moac 子链
      res = await this.walletProvider.buyMintTokenTrue(
        secret,
        this.info.erc20_address,
        this.info.MicroChain,
        this.amount
      );
    }
    this.amount = null;
    console.log("充值结果", res);
    this.navCtrl.pop();
    //0xf2ccb67883e82b83ef7efe7b21c826a940f44233e06c84831d60abae34a2b766
    if (res) {
      this.presentToast(this.getResult('assets.11'));
    } else {
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChargePage");
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      title: this.getResult('assets.1'),
      message: msg,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });
    prompt.present();
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: "top",
      cssClass: "toast"
    });

    toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
    });

    toast.present();
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
