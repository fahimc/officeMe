(function(){
	var Main={
		MODERATOR_CHANNEL_ID : 'ABCDEF-',
		MODERATOR_SESSION_ID :'XYZ',   
		MODERATOR_ID         : 'JKL', 
		MODERATOR_SESSION    : {        
			audio: true,
			video: true
		},
		MODERATOR_EXTRA      : {},     
		init:function(){
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			this.MODERATOR_CHANNEL_ID +=window.RMCDefaultChannel;
			this.start();
		},
		start:function(){
			var participants = new RTCMultiConnection(this.MODERATOR_CHANNEL_ID);
			participants.join({
				sessionid: this.MODERATOR_SESSION_ID,
				userid: this.MODERATOR_ID,
				extra: this.MODERATOR_EXTRA,
				session: this.MODERATOR_SESSION
			});
		}
	};


	Main.init();

})();