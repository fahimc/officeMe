(function(){
	var Main={
		MODERATOR_CHANNEL_ID : 'HOMEME-',
		MODERATOR_SESSION_ID :'XYZ',   
		MODERATOR_ID         : 'JKL', 
		MODERATOR_SESSION    : {        
			audio: true,
			video: true
		},
		MODERATOR_EXTRA      : {},    
		connection:null, 
    isMute:false,
		init:function(){
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			this.MODERATOR_CHANNEL_ID += window.location.hostname.replace(/\W+/g, " ");
			console.log(this.MODERATOR_CHANNEL_ID);
			var params = [] 
			if(window.location.hash.substr(1))params =  window.location.hash.substr(1).toLowerCase().split("/");
			console.log(params);
			if(params.length)
			{
				if(params[0]=="join")
				{
					if(!params[1])
					{
						this.error();
					}else{
						this.MODERATOR_CHANNEL_ID +=params[1];
						this.join();
						document.body.classList.add('viewer');
					}
				}else{
					this.MODERATOR_CHANNEL_ID +=params[0];
					this.start();
				}
				
			}else{
				this.error();
			}
			this.setListeners();
		},
		setListeners:function(){
			document.getElementById('mute').addEventListener('click',this.toggleMute.bind(this));
		},
		error:function(){
			console.log("error");
		},
		start:function(){
			var moderator = new RTCMultiConnection(this.MODERATOR_CHANNEL_ID);
			moderator.session = this.MODERATOR_SESSION;
			moderator.userid = this.MODERATOR_ID;
			moderator.extra = this.MODERATOR_EXTRA;
			moderator.open({
				dontTransmit: true,
				sessionid: this.MODERATOR_SESSION_ID
			});
			this.connection = moderator;
      this.setConnection();
		},
		join:function(){
			var participants = new RTCMultiConnection(this.MODERATOR_CHANNEL_ID);
			participants.join({
				sessionid: this.MODERATOR_SESSION_ID,
				userid: this.MODERATOR_ID,
				extra: this.MODERATOR_EXTRA,
				session: this.MODERATOR_SESSION
			});
			this.connection = participants;
      this.setConnection();
		},
    setConnection:function(){
    
this.connection.onmute =this.onMute.bind(this);
      this.connection.onunmute =this.onUnMute.bind(this);
    },
    onMute:function(event){
      this.isMute=true;
      //e.mediaElement.setAttribute('poster', '//www.webrtc-experiment.com/images/muted.png');
    },
    onUnMute:function(event){
      this.isMute=false;
      //e.mediaElement.setAttribute('poster', '//www.webrtc-experiment.com/images/muted.png');
    },
		toggleMute:function(){
      console.log(this.isMute);
      if(!this.isMute){
        this.connection.streams.mute({
				video: false,
				type: 'local'
			});
      }else{
        this.connection.streams.unmute({
				video: false,
				type: 'local'
			});
      }
			
		}
	};


	Main.init();

})();