//Backup Cloud Functions:
//Spoof Proof Logics
Moralis.Cloud.define("exists", async (request) => {
  		const logger = Moralis.Cloud.getLogger();
		logger.info(JSON.stringify(request.params.eth)); 
  		const result1=await new Moralis.Query("_EthAddress")
        .equalTo("objectId",request.params.eth)
      	.find({useMasterKey:true});
  		const result2=await new Moralis.Query("_User")
        .equalTo("objectId",result1[0].get("user").id)
      	.find({useMasterKey:true});
  		const buffer=JSON.stringify(result2[0]);
  		return JSON.parse(buffer).email===undefined;
});

Moralis.Cloud.define('setSessionType',async (request)=>{
  		const sessionData=Moralis.Object.extend('_Session');
  		const result=await new Moralis.Query('_Session')
        .equalTo('sessionToken',request.params.token)
      	.first({useMasterKey:true});
  		let match = new sessionData();
  		match=result;
  		match.set('signInType',request.params.type);
  		await match.save(null,{useMasterKey:true});
  		return match;
});
Moralis.Cloud.define('getSessionType',async (request)=>{
  		const result=JSON.stringify(await new Moralis.Query('_Session')
        .equalTo('sessionToken',request.params.token)
      	.first({useMasterKey:true}));
  		let sessionData={};
  		if(result){
          sessionData={
          	signInType:JSON.parse(result)?.signInType
          };
        }
  		return sessionData;
});

//Contact Requires Functions

Moralis.Cloud.define('getFriends',async (request)=>{
  		const logger = Moralis.Cloud.getLogger();
  		const Friends = Moralis.Object.extend("Friends");
  		const FriendAcct = Moralis.Object.extend("Friend_Accounts");
  		let friends= await new Parse.Query(Friends).equalTo('user',request.params.name).find({useMasterKey:true});
  		let result=[];
  		for(let i=0;i<friends.length;i++){
          	let accounts=[];
          	let faccts=await new Parse.Query(FriendAcct).equalTo('friend',friends[i]).find({useMasterKey:true});
          	for(let j=0;j<faccts.length;j++){
            	accounts.push({addrId:faccts[j].id,address:faccts[j].get("publicAddress")});
            }
          	result.push({
               accounts,
               block:friends[i].get("block"),
               name:friends[i].get("friendName"),
               contactId:friends[i].id,
               actualName:friends[i].get("actualName")
              });
        }
  		return result;
});
Moralis.Cloud.define('delAcct',async (request)=>{
		const logger = Moralis.Cloud.getLogger();
  		const FriendAcct = Moralis.Object.extend("Friend_Accounts");
  		let accts=request.params.accts;
  		for(let i=0;i<accts.length;i++){
        	const obj=await new Parse.Query(FriendAcct).equalTo('objectId',accts[i]).first({useMasterKey:true});
          	if (obj) {
    			await obj.destroy(null,{});
              	return true;
            }
        }
});
Moralis.Cloud.define('editAcct',async (request)=>{
		const logger = Moralis.Cloud.getLogger();
  		const FriendAcct = Moralis.Object.extend("Friend_Accounts");
  		const Friend = Moralis.Object.extend("Friends");
  		const friend=await new Parse.Query(Friend).equalTo('objectId',request.params.fid).first({useMasterKey:true});
  		const user=await new Parse.Query(Friend).equalTo('objectId',request.params.uid).first({useMasterKey:true});
  		let faccts=request.params.facct;
  		let uacct=request.params.uacct;
  		const del1=await new Parse.Query(FriendAcct).equalTo('friend',friend).find({useMasterKey:true});
  		const del2=await new Parse.Query(FriendAcct).equalTo('friend',user).find({useMasterKey:true});
  		if(del1){
        	for(let i=0;i<del1.length;i++){
            	const obj=del1[i];
              	if(obj){
                	await obj.destroy(null,{});
                }
            }
        }
  		for (let i = 0; i < faccts.length; i++) {
    		let acctEntity = new FriendAcct();
    		acctEntity.set("friend", friend);
    		acctEntity.set("publicAddress", faccts[i]);
          	await acctEntity.save();
		}
  		if(uacct.length!==0){
        	let acctEntity = new FriendAcct();
			acctEntity.set("friend",user);
			acctEntity.set("publicAddress", uacct);
  			await acctEntity.save();
        }
		const Request = Moralis.Object.extend("Requests");
  		const Pending = Moralis.Object.extend("Pending");
  		const rqst=await new Parse.Query(Request).equalTo({'userName':user.get('user'),'friendName':user.get('actualName')}).first({useMasterKey:true});
  		const pending=await new Parse.Query(Pending).equalTo({'userName':friend.get('user'),'friendName':friend.get('actualName')}).first({useMasterKey:true});
  		if (rqst && pending) {
    			await pending.destroy(null,{});
          		await rqst.destroy(null,{});
              	return true;
        }
});
Moralis.Cloud.define('PostRequest',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
  		const Request = Moralis.Object.extend("Requests");
  		const Pending = Moralis.Object.extend("Pending");
  		let extflg=false;
  		const pends=await new Parse.Query(Pending).equalTo('userName',request.params.tgtName).find({useMasterKey:true});
  		for(let i=0;i<pends.length;i++){
          	let tmp=pends[i].get("friendName");
        	if(tmp.length>0 && tmp!==null && tmp===request.params.name){extflg=true;break;}
        }
  		if(!extflg){
          	const rqst=new Request();
  			const pending=new Pending();
  			rqst.set('userName',request.params.name);
  			rqst.set('friendName',request.params.tgtName);
          	rqst.set('fromAddr',request.params.fromAddr);
  			pending.set('userName',request.params.tgtName);
  			pending.set('friendName',request.params.name);
          	pending.set('nickName',request.params.nickname);
  			await rqst.save(null,{useMasterKey:true})
        	const rslt= await pending.save(null,{useMasterKey:true});
          	return rslt;
        }
  		else{
        	return false;
        }
});
Moralis.Cloud.define('getInvites',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
		const Request = Moralis.Object.extend("Requests");
  		const Pending = Moralis.Object.extend("Pending");
  		const requests=await new Parse.Query(Request).equalTo('userName',request.params.name).find({useMasterKey:true});
  		const pendings=await new Parse.Query(Pending).equalTo('userName',request.params.name).find({useMasterKey:true});
  		return{ reqs:requests,pends:pendings};
});
Moralis.Cloud.define('getUser',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
		const Friend = Moralis.Object.extend("Friends");
  		const User= Moralis.Object.extend("_User");
  		const user=await new Parse.Query(User).equalTo('username',request.params.name).first({useMasterKey:true});
  		if(user){
          	const friends=await new Parse.Query(Friend).equalTo('user',request.params.fromname).find({useMasterKey:true});
          	let result=[];
  				for(let i=0;i<friends.length;i++){
          				if(friends[i].get("actualName")===request.params.name)
                        {result.push(friends[i]);break;}
        		}
          if(result.length!==0){
            return result;
          }
          else{
          	return "avail";
          }
        }
  		return null;
});
Moralis.Cloud.define('acceptInvite',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
		const Request = Moralis.Object.extend("Requests");
		const Pending = Moralis.Object.extend("Pending");
		const Friend = Moralis.Object.extend("Friends");
		const FriendAcct = Moralis.Object.extend("Friend_Accounts");
		const rqst = await new Parse.Query(Request).equalTo('objectId', request.params.id).first({ useMasterKey: true });
		const pending = await new Parse.Query(Pending).equalTo({ 'userName': rqst.get("friendName"), 'friendName': rqst.get("userName") }).first({ useMasterKey: true });
		
  		//first completeing pending
  		let friend = new Friend();
		friend.set("user", pending.get('userName'));
		friend.set("friendName", pending.get('nickName'));
		friend.set("actualName", pending.get('friendName'));
		friend.set("block", false);
		let result = await friend.save();
  		const addrs=request.params.accts;
		for (let i = 0; i < addrs.length; i++) {
    		let acctEntity = new FriendAcct();
    		acctEntity.set("friend", result);
    		acctEntity.set("publicAddress", addrs[i]);
          	await acctEntity.save();
		}
  
  		//second completing from requests
		friend = new Friend();
		friend.set("user", rqst.get('userName'));
		friend.set("friendName",request.params.fnick);
		friend.set("actualName", rqst.get('friendName'));
		friend.set("block", false);
  		result = await friend.save();
		let acctEntity = new FriendAcct();
		acctEntity.set("friend", result);
		acctEntity.set("publicAddress", rqst.get('fromAddr'));
  		await acctEntity.save();
  		if (rqst && pending) {
    			await pending.destroy(null,{});
          		await rqst.destroy(null,{});
              	return true;
        }
		
});
Moralis.Cloud.define('removeInvite',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
		const Request = Moralis.Object.extend("Requests");
  		const Pending = Moralis.Object.extend("Pending");
  		const rqst=await new Parse.Query(Request).equalTo('objectId',request.params.id).first({useMasterKey:true});
  		const pending=await new Parse.Query(Pending).equalTo({'userName':rqst.get('friendName'),'friendName':rqst.get('userName')}).first({useMasterKey:true});
  		if (rqst && pending) {
    			await pending.destroy(null,{});
          		await rqst.destroy(null,{});
              	return true;
        }
});
Moralis.Cloud.define('cancelRequest',async(request)=>{
		const logger = Moralis.Cloud.getLogger();
		const Request = Moralis.Object.extend("Requests");
  		const Pending = Moralis.Object.extend("Pending");
  		const pending=await new Parse.Query(Pending).equalTo('objectId',request.params.id).first({useMasterKey:true});
  		const rqst=await new Parse.Query(Request).equalTo({'userName':pending.get('friendName'),'friendName':pending.get('userName')}).first({useMasterKey:true});
  		if (rqst && pending) {
    			await pending.destroy(null,{});
          		await rqst.destroy(null,{});
              	return true;
        }
});
Moralis.Cloud.define('fetchFriends',async(request)=>{
  		const Friend = Moralis.Object.extend("Friends");
  		const FriendAcct = Moralis.Object.extend("Friend_Accounts");
  		const friend= await new Parse.Query(Friend).equalTo({'user':request.params.name,'actualName':request.params.fromname}).first({useMasterKey:true});
  		const user= await new Parse.Query(Friend).equalTo({'user':request.params.fromname,'actualName':request.params.name}).first({useMasterKey:true});
  		let friends= await new Parse.Query(FriendAcct).equalTo({'friend':friend}).find({useMasterKey:true});
  		let result1=[];
  		if(friends.length>0 && friend){
  				for(let i=0;i<friends.length;i++){
          				result1.push({id:friends[i].id,addr:friends[i].get('publicAddress')});
        		}
        }
  		friends= await new Parse.Query(FriendAcct).equalTo({'friend':user}).find({useMasterKey:true});
  		let result2=[];
  		if(friends.length>0 && friend){
  				for(let i=0;i<friends.length;i++){
          				result2.push({id:friends[i].id,addr:friends[i].get('publicAddress')});
        		}
        }
  		return {user,userEnt:result2,friend,friendEnt:result1};
});
Moralis.Cloud.define('updateName',async(request)=>{
		const Friend = Moralis.Object.extend("Friends");
  		const friend= await new Parse.Query(Friend).equalTo('objectId',request.params.id).first({useMasterKey:true});
  		friend.set('friendName',request.params.nick);
  		await friend.save(null,{useMasterKey:true});
  		return friend;
});

Moralis.Cloud.define('transferPost',async(request)=>{
  const Tran= Moralis.Object.extend("Transactions");
  let tran=new Tran();
    tran.set('senderName',request.params.senderName);
    tran.set('receiverName',request.params.receiverName);
    tran.set('units',request.params.units);
    tran.set('Category',request.params.catg);
    tran.set('Description',request.params.desc);
    tran.set('Network',request.params.network);
    tran.set('senderAddress',request.params.sendAddr);
    tran.set('receiverAddress',request.params.recvAddr);
    tran.set('transactionHash',request.params.transactionhash);
  	tran.set('confirmed',false);
  	tran.set('Token',request.params.tokenAddress);
    await tran.save(null,{useMasterKey:true});
});

Moralis.Cloud.define('getStatus',async(request)=>{
  		let Chain=undefined;
  		let ChainColl="";
		switch(request.params.chain){
          case 1:
            	Chain = Moralis.Object.extend("EthTransactions");
            	ChainColl="EthTransactions";
            	break;
          case 80001:
            	Chain = Moralis.Object.extend("PolygonTransactions");
            	ChainColl="PolygonTransactions";
            	break;
          case 137:
            	Chain = Moralis.Object.extend("PolygonTransactions");
            	ChainColl="PolygonTransactions";
            	break;
          case 43113:
            	Chain = Moralis.Object.extend("AvaxTransactions");
            	ChainColl="AvaxTransactions";
            	break;
          default:
            	break;
        }
  		if(Chain){
        	const trans=await new Parse.Query(Chain).aggregate([
            	{
                  match:{'to_address':request.params.addr}
                },
              	{
                  unionWith:{
                    coll:ChainColl,
                    pipeline:[
                      {
                        $match:{'from_address':request.params.addr}
                      }
                    ]
                  }
                },
              	{
                  sort:{'block_timestamp':-1}
                }
            ]);
        	const Tran= Moralis.Object.extend("Transactions");
          	let stats=[];
          	for(let i=0;i<trans.length;i++){
              	const trn=await new Moralis.Query(Tran).equalTo('transactionHash',trans[i].hash).first();
              	if(trn){
                  stats.push({
                	confirm:trans[i].confirmed,
                  	gas:trans[i].gas,
                  	senderName:trn.get('senderName'),
  					receiverName:trn.get('receiverName'),
  					units:trn.get('units'),
  					catg:trn.get('Category'),
  					desc:trn.get('Description'),
  					network:trn.get('Network'),
  					sendAddr:trn.get('senderAddress'),
   					recvAddr:trn.get('receiverAddress'),
  					transactionhash:trn.get('transactionHash'),
                    tstamp:trans[i].block_timestamp,
                    tokenAddress:trn.get('Token')
                });
              }
            }
        	return stats;
        }
});
Moralis.Cloud.define('WebsocketTran',async(request)=>{
  	const tconfirm = await new Moralis.Query(request.params.coll).equalTo('hash', request.params.hash).subscribe();
  	const Tran= Moralis.Object.extend("Transactions");
  	tconfirm.on('update', async(obj) => {
   	if (obj.get('confirmed')) {
      		const trn=await new Moralis.Query(Tran).equalTo('transactionHash',request.params.hash).first();
      		trn.set('confirmed',true);
      		await trn.save();
            tconfirm.unsubscribe();
       }
    });
});