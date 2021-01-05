import { Component,ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../providers/wallet';
import { AccountPage } from './account/account'
import { CollectionlistPage } from './collectionlist/collectionlist'
import { AddassetsPage } from './addassets/addassets'
import { Storage } from "@ionic/storage";
import { TokendetailsPage } from './tokendetails/tokendetails';
import { MenuController } from 'ionic-angular';
import { CollectionreceivePage } from './collectionlist/collectionreceive/collectionreceive';
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operator/takeUntil';
// import VConsole from 'vconsole';
// var vConsole = new VConsole();
/**
 * Generated class for the AssetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-asset',
  templateUrl: 'asset.html',
})
export class AssetPage extends BaseUI{
    @ViewChild(Slides) slides: Slides;
    tabs:string = 'pass';
    pockets:any=[];
    user:any={};
    ERC20:any=[];
    ERC721:any=[];
    tokens:any=[];//通证余额
    Tokens:any; //storage里面的token
    Token721:any; //storage里面的token721
    Token20:any; //storage里面的token20
    collections:any=[];//收藏品余额
    constructor(
      public navCtrl: NavController, 
      public navParams: NavParams,
      private storage:Storage,
      private zone: NgZone,
      public menuCtrl: MenuController,
      public walletProvider: WalletProvider,
      public translate: TranslateService,
      public alertCtrl:AlertController) {
        super();
        setTimeout(() => {
            this.getPockets();//获取所有钱包
        }, 1000);
    }
    addAssets(){
        this.navCtrl.push('AddassetsPage',{
            'type':this.tabs
        })
    }
    
    ionViewDidLoad() {
    //   // console.log('ionViewDidLoad AssetPage');
    //     this.getPockets();//获取所有钱包
    }
    ionViewWillEnter(){
        if(this.tokens.length > 0 || this.collections.length > 0){
            this.onlyGetPockets();//时时更新钱包
            // this.getPockets();//获取所有钱包
            this.onlyGetTokens();//时时更新资产
        }
    }
    onlyGetPockets(){
        this.storage.get('pockets').then((p)=>{
            if(p){
                if(p.length != this.pockets.length){
                    this.pockets = p;   
                }
                // this.user = p[0];
                // this.storage.set('user',this.user);
            }
        })
    }
    async onlyGetTokens(){
        let that = this;
        if(await this.storage.get('tokens')){
            that.Tokens = await that.storage.get('tokens');
            that.Token721 = that.Tokens.ERC721;
            that.Token20 = that.Tokens.ERC20;
            console.log(that.Tokens)
            that.ERC721=[];
            that.ERC20=[];
            for(let key in that.Tokens.ERC721){
                if(that.Tokens.ERC721[key].flag == true){
                    that.ERC721.push(that.Tokens.ERC721[key].symbol);
                }
            }
            for(let key in that.Tokens.ERC20){
                if(that.Tokens.ERC20[key].flag == true){
                    that.ERC20.push(that.Tokens.ERC20[key].symbol);
                }
            }
            console.log('this.ERC20',that.ERC20);
            console.log('this.ERC721',that.ERC721);
        }else{
            that.ERC721 = ['NFT'];
            that.ERC20 = [];
        }
        that.getMoacAndTokenBalances();
        that.getCollectionBalances();
    }
    async getPockets(){
        let that = this;
        if(await that.storage.get('pockets')){
            that.pockets = await that.storage.get('pockets');
            console.log('pockets',that.pockets)
            that.user=that.pockets[0];
            that.storage.set('user',that.user);
            // this.getCollectionBalances();//页面出来 点击再条用
        }
        if(await that.storage.get('tokens')){
            that.Tokens = await that.storage.get('tokens');
            that.Token721 = that.Tokens.ERC721;
            that.Token20 = that.Tokens.ERC20;
            console.log(that.Tokens)
            that.ERC721=[];
            that.ERC20=[];
            for(let key in that.Tokens.ERC721){
                if(that.Tokens.ERC721[key].flag == true){
                    that.ERC721.push(that.Tokens.ERC721[key].symbol);
                }
            }
            for(let key in that.Tokens.ERC20){
                if(that.Tokens.ERC20[key].flag == true){
                    that.ERC20.push(that.Tokens.ERC20[key].symbol);
                }
            }
            console.log('this.ERC20',that.ERC20);
            console.log('this.ERC721',that.ERC721);
        }else{
            that.ERC721 = ['NFT'];
            that.ERC20 = [];
        }
        that.getMoacAndTokenBalances();
    }
    async getMoacAndTokenBalances(){//获得MOAC和ERC20代币的余额  --moac放在第一个
        let that = this;
        let balances:any;
        try {
            balances = await that.walletProvider.getMoacAndTokenBalances(that.user.address,that.ERC20) || [];
            for(let key in balances){
                for(let item in that.Token20){
                    if(balances[key].code == that.Token20[item].symbol){
                        balances[key].icon = that.Token20[item].icon;
                    }
                }
            }
            that.zone.run(() => {
                that.tokens = balances;
            });
        } catch (e) {
            console.log('e',e);
            that.tokens = [];
        }
        // this.tokens = await this.walletProvider.getMoacAndTokenBalances(this.user.address,this.ERC20) || [];
        console.log(this.tokens)
    }
    async getCollectionBalances(){//获得ERC721收藏品的余额
        let that = this;
        let balances:any;
        try {
            balances = await that.walletProvider.getCollectionBalances(that.user.address,that.ERC721) || [];
            for(let key in balances){
                for(let item in that.Token721){
                    if(balances[key].code == that.Token721[item].symbol){
                        balances[key].icon = that.Token721[item].icon;
                    }
                }
            }
            that.zone.run(() => {
                that.collections = balances;
            });
        } catch (e) {
            console.log('e',e);
            that.collections = [];
        }
        // this.collections = await this.walletProvider.getCollectionBalances(this.user.address,this.ERC721) || [];
        console.log(that.collections)
    }
    slideChanged(){//切换钱包
        let currentIndex:number = this.slides.getActiveIndex();
        if(currentIndex==this.pockets.length){
            currentIndex=this.pockets.length-1;
        }
        this.user=this.pockets[currentIndex];
        this.storage.set('user',this.user);
        console.log(this.user);
        this.tabs='pass';
        this.getMoacAndTokenBalances();
    }
    toTokenDetails(item){//去通证详情
        // if(item.value == 0){
        //     this.errorMsg('暂无余额');
        // }else{
            this.navCtrl.push('TokendetailsPage',{
                'item':item
            });
        // }
    }
    toCollectionDetails(item){//去收藏品详情
        // if(item.value == 0){
        //     this.errorMsg('暂无余额');
        // }else{
            this.navCtrl.push('CollectionlistPage',{
                'item':item,
                'user':this.user
            });
        // }
    }
    jump(item){
        if(item != ''){
            this.navCtrl.push(item);
        }else{
            //err
        }
    }
    openMenu() {
        this.menuCtrl.open();
    }
    errorMsg(msg){
        //错误提示
        let prompt = this.alertCtrl.create({
            title:this.getResult("assets.1"),
            message: msg,
            buttons: [
                {
                  text: 'OK',
                  handler: data => {
                  }
                }
            ]
        });
        prompt.present();
    }   
    doRefresh(refresher){
        // refresher.complete();
        setTimeout(() => {
            this.onlyGetTokens();//刷新通证资产
            console.log('刷新成功');
            refresher.complete();
        }, 1000);

    }
    doRefresh1(refresher){
        // refresher.complete();
        setTimeout(() => {
            this.onlyGetTokens();//刷新收藏品资产
            console.log('刷新成功');
            refresher.complete();
        }, 1000);

    }
    ionViewDidEnter() {
        //进入显示TabBars

        // this.getPockets();//获取所有钱包
        let elements=document.querySelectorAll(".tabbar");
        if(elements != null){
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'flex';
            });
        }
    }
    getResult(msg){
        return super.getI18n(msg,this.translate)
    }
}
