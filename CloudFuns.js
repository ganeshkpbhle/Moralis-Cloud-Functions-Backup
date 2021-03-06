const contractIdlist=[
	'0xb0897686c545045afc77cf20ec7a532e3120e0f1',
	'0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
	'0x2791bca1f2de4661ed88a30C99a7a9449aa84174',
	'0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
	'0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
	'0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
	'0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
	'0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
	'0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
	'0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
	'0x84b9b910527ad5c03a9ca831909e21e236ea7b06',
	'0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
	'0xa83575490D7df4E2F47b7D38ef351a2722cA45b9',
	'0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8',
	'0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378',
	'0x64544969ed7EBf5f083679233325356EbE738930'
  ];
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
			const Friends = Moralis.Object.extend("Friends");
			let friends= [];
			let pends=[];
			let reqs=[];
			friends=await new Parse.Query(Friends).equalTo('user',request.params.name).find({useMasterKey:true});
			friends=friends?.map((e)=>({name:e.get('actualName'),flg:e.get('block')})).filter((e)=>e.flg===true).map((e)=>e.name);
			let requests=await new Parse.Query(Request).equalTo('userName',request.params.name).find({useMasterKey:true});
			let pendings=await new Parse.Query(Pending).equalTo('userName',request.params.name).find({useMasterKey:true});
			for(let i=0;i<requests.length;i++){
			  if(!friends.includes(requests[i].get('friendName'))){
				  reqs.push(requests[i]);
			  }
		  }
			for(let i=0;i<pendings.length;i++){
			  if(!friends.includes(pendings[i].get('userName'))){
				  pends.push(pendings[i]);
			  }
		  }
			return{ reqs,pends};
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
		tran.set('tstamp',new Date(request.params.tstamp));
	  await tran.save(null,{useMasterKey:true});
  });
  
  Moralis.Cloud.define('getStatus',async(request)=>{
			let ChainColl=undefined;
			let ChainSub=undefined;
			let collection="Transactions";
			switch (request.params.chain){
			  case 1:
				  ChainColl=Moralis.Object.extend("EthTransactions");
				  ChainSub=Moralis.Object.extend("EthTokenTransfers");
				  break;
			  case 137:
				  ChainColl=Moralis.Object.extend("PolygonTransactions");
				  ChainSub=Moralis.Object.extend("PolygonTokenTransfers");
				  break;
			  case 80001:
				  ChainColl=Moralis.Object.extend("PolygonTransactions");
				  ChainSub=Moralis.Object.extend("PolygonTokenTransfers");
				  break;
			  case 43113:
				  ChainColl=Moralis.Object.extend("AvaxTransactions");
				  ChainSub=Moralis.Object.extend("AvaxTokenTransfers");
				  break;
			  case 56:
				  ChainColl=Moralis.Object.extend("BscTransactions");
				  ChainSub=Moralis.Object.extend("BscTokenTransfers");
				  break;
			  case 97:
				  ChainColl=Moralis.Object.extend("BscTransactions");
				  ChainSub=Moralis.Object.extend("BscTokenTransfers");
					  break;
		  }
			const trans=await new Parse.Query("Transactions").equalTo('Network',request.params.chain.toString()).aggregate([
				  {
					match:{'senderAddress':request.params.addr}
				  },
					{
					unionWith:{
					  coll:collection,
					  pipeline:[
						{
						  $match:{
							  $and:[
									{'receiverAddress':{$in:[request.params.addr]}},
									{'Network':{$in:[request.params.chain.toString()]}}
								]
						  }
						}
					  ]
					}
				  },
					{
					sort:{'tstamp':-1}
				  }
			  ]);
			let stats=[];
			for(let i=0;i<trans.length;i++){
				const coll=await new Moralis.Query(ChainColl).equalTo('hash',trans[0].transactionHash).first({useMasterKey:true});
			  const subcoll=await new Moralis.Query(ChainSub).equalTo('transaction_hash',trans[0].transactionHash).first({useMasterKey:true});
			  const gas=coll.get('gas');
				
				stats.push(
				{
					senderName:trans[i].senderName,
				  receiverName:trans[i].receiverName,
				  units:trans[i].units,
				  catg:trans[i].Category,
				  desc:trans[i].Description,
				  network:trans[i].Network,
				  sendAddr:trans[i].senderAddress,
				  recvAddr:trans[i].receiverAddress,
				  transactionhash:trans[i].transactionHash,
				  confirm:(coll.length>0)?coll.get('confirmed'):trans[i].confirmed,
				  gas:gas,
				  tstamp:new Date(trans[i].tstamp.iso).toUTCString(),
				  tokenAddress:trans[i].Token
				}
			  );
		  }
			return stats;
  });
  
  
  Moralis.Cloud.define('getHistory',async(request)=>{
			let ChainColl=undefined;
			let ChainSub=undefined;
			switch (request.params.chain){
			  case 1:
				  ChainColl=Moralis.Object.extend("EthTransactions");
				  ChainSub=Moralis.Object.extend("EthTokenTransfers");
				  break;
			  case 137:
				  ChainColl=Moralis.Object.extend("PolygonTransactions");
				  ChainSub=Moralis.Object.extend("PolygonTokenTransfers");
				  break;
			  case 80001:
				  ChainColl=Moralis.Object.extend("PolygonTransactions");
				  ChainSub=Moralis.Object.extend("PolygonTokenTransfers");
				  break;
			  case 43113:
				  ChainColl=Moralis.Object.extend("AvaxTransactions");
				  ChainSub=Moralis.Object.extend("AvaxTokenTransfers");
				  break;
			  case 56:
				  ChainColl=Moralis.Object.extend("BscTransactions");
				  ChainSub=Moralis.Object.extend("BscTokenTransfers");
				  break;
			  case 97:
				  ChainColl=Moralis.Object.extend("BscTransactions");
				  ChainSub=Moralis.Object.extend("BscTokenTransfers");
					  break;
		  }
			let start=new Date(request.params.start.substring(0,10));
			let end=new Date(request.params.end.substring(0,10));
			//start.setHours(start.getHours()+22);
			end.setHours(end.getHours()+24);
			const st=start.toISOString();
			const ed=end.toISOString();
			const trans=await new Parse.Query("Transactions").equalTo('Network',request.params.chain.toString()).aggregate([
				  {
					match:{
						  $expr: {
										$and: [
										  { $eq: ["$receiverAddress", request.params.addr] },
											{
											  $gte: ["$_created_at",{"$toDate":st}]
										  },
										  {
											  $lte: ["$_created_at",{"$toDate":ed}]
										  }
										]
								  }
						}
					
				  },
					{
					unionWith:{
					  coll:"Transactions",
					  pipeline:[
						   {
								$match: {
								  $expr: {
										$and: [
										  { $eq: ["$senderAddress", request.params.addr] },
											{ $eq: ["$Network", request.params.chain.toString()] },
											{
											  $gte: ["$_created_at",{"$toDate":st}]
										  },
										  {
											  $lte: ["$_created_at",{"$toDate":ed}]
										  }
										]
								  }
								}
						  }
					  ]
					}
				  },
					{
					sort:{'tstamp':-1}
				  }
			  ],{useMasterKey:true});
			let history=[];
			for(let i=0;i<trans.length;i++){
				const coll=await new Moralis.Query(ChainColl).equalTo('hash',trans[0].transactionHash).first({useMasterKey:true});
			  const subcoll=await new Moralis.Query(ChainSub).equalTo('transaction_hash',trans[0].transactionHash).first({useMasterKey:true});
			  const gas=(coll)?coll.get('gas'):'';
				history.push(
				{
					senderName:trans[i].senderName,
				  receiverName:trans[i].receiverName,
				  units:trans[i].units,
				  catg:trans[i].Category,
				  desc:trans[i].Description,
				  network:trans[i].Network,
				  sendAddr:trans[i].senderAddress,
				  recvAddr:trans[i].receiverAddress,
				  transactionhash:trans[i].transactionHash,
				  confirm:trans[i].confirmed,
				  gas:gas,
				  tstamp:new Date(trans[i].tstamp.iso).toUTCString(),
				  tokenAddress:trans[i].Token
				}
			  );
		  }
			return history;
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
  Moralis.Cloud.define('countPlot',async(request)=>{
			const User= Moralis.Object.extend("_User");
			const trans=new Parse.Query("Transactions");
			let accts=[];
			const user=await new Parse.Query(User).equalTo('objectId',request.params.id).first({useMasterKey:true});
			accts=user.get('accounts');
		  const pipeNwk=[
				  {
					match:{'receiverAddress':{$in:accts}}
				  },
				  { 
					group: {
					  objectId:"$Network",
					  total:{ $sum:1 },
					  desg:{ "$first":0 }
					} 
				  },
				  {
					unionWith:{
					  coll:"Transactions",
					  pipeline:[
						{
						  $match:{'senderAddress':{$in:accts}}
						},
						{ 
							$group: {
							  _id:"$Network",
							  total:{ $sum:1 },
								desg:{ "$first":1 }
							 } 
						}
					  ]
					}
				  }
				];
			const pipeCtg=[
				  {
					match:{'senderAddress':{$in:accts}}
				  },
				  { 
					group: {
					  objectId:"$Category",
					  total:{ $sum:1 }
					} 
				  }
			  ];
		  const nwkwise=await trans.aggregate(pipeNwk);
			const ctgwise=await trans.aggregate(pipeCtg);
			const chainSet=Array.from(new Set(nwkwise.map(({objectId:name})=>(name))));
			const numcard=chainSet.map((name)=>{
			const nwkIn=nwkwise.find(o => o.desg===0 && o.objectId===name)?.total;
			const nwkOut=nwkwise.find(o => o.desg===1 && o.objectId===name)?.total
			return {
						name,
						In:(nwkIn)?nwkIn:0,
						Out:(nwkOut)?nwkOut:0
			};
		  });
			const catg=ctgwise.flat().map(({objectId:name,total:value})=>({name,value}));
			return {numcard,catg};
  });
  Moralis.Cloud.define("blockFriend", async (request) => {
	const Friends = Moralis.Object.extend("Friends");
	let friend= await new Moralis.Query(Friends).equalTo('objectId',request.params.id).first({useMasterKey:true});
	friend.set('block',request.params.flg);
	await friend.save(null,{useMasterKey:true});
	return friend;
  });
  Moralis.Cloud.define('WeeklyCount',async(request)=>{
			let start=new Date(request.params.start.substring(0,10));
			let end=new Date(request.params.end.substring(0,10));
			//start.setHours(start.getHours()+22);
			end.setHours(end.getHours()+24);
			const st=start.toISOString();
			const ed=end.toISOString();
			const trans=await new Parse.Query("Transactions")//.equalTo('Network',request.params.chain.toString())
		  .aggregate([
				  {
					match:{
						  $expr: {
										$and: [
										  { $eq: ["$receiverAddress", request.params.acct] },
											{
											  $gte: ["$_created_at",{"$toDate":st}]
										  },
										  {
											  $lte: ["$_created_at",{"$toDate":ed}]
										  }
										]
								  }
						}
					
				  },
					//{
				  //        group: {
				  //    		objectId:{token:"$Token"},
				  //          	network:{$first:"$Network"},
				  //    		count:{$sum:1}
				  //  		}
				  //},
					{
					unionWith:{
					  coll:"Transactions",
					  pipeline:[
						   {
								$match: {
								  $expr: {
										$and: [
										  { $eq: ["$senderAddress", request.params.acct] },
											//{ $eq: ["$Network", request.params.chain.toString()] },
											{
											  $gte: ["$_created_at",{"$toDate":st}]
										  },
										  {
											  $lte: ["$_created_at",{"$toDate":ed}]
										  }
										]
								  }
								}
						  }//,
							//{
								//$group: {
							  //	_id:{token:"$Token"},
							  //  	network:{$first:"$Network"},
							  //	count:{$sum:1}
								//}
							//}
					  ]
					}
				  },
					//{
					//	group: {
					 // 	objectId:"$_id.token",
					 // 	value:{$sum:"$count"},
					 //   	network:{$first:"$_id.network"}
					//	}
					//}
				  {
						 group: {
							   objectId:{token:"$Token"},
							   network:{$first:"$Network"},
							   count:{$sum:1}
							}
				  },
					{
							group: {
							   objectId:{name:"$network"},
							   series:{$push:{name:"$_id.token",value:{$sum:"$count"}}}
							}
				  }
		  ],{useMasterKey:true});
			return trans;
  });