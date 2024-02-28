function humanizeNumber(n){
  var d = ',';
  var s = '.';
  n = n.toString().split('.');
  n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + d);
  return n.join(s);
};

function kmbFormatter(n) {

  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
}

function openAttachment() {
  document.getElementById('attachment').click();
}

async function fileSelected(input){

            
  if (!input.files[0].type.startsWith("image/")) {
      return;
  }

  input.files[0].arrayBuffer()
      .then((buffer) => {
          let base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

          let img_src = `data:${input.files[0].type};base64,${base64String}`; 

          (async () => {

            console.log(xmr.GetPrivate().Accounts);
            let result = await xmr.GetPrivate().Accounts.change_profile_photo(img_src);

            console.log(result);

            setTimeout(() => {
              window.location.href = '/accounts/settings';
            }, 3000);

          })();

          
      })
      .catch((e) => console.log(e));
  

}

async function ApplyZeroCacheScripts( scripts ) {
  let load_count = 0;
  const sleep = async () => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  for (let i = 0; i < scripts.length; i++) {

    let script = scripts[i];

    let type = script[0];
    let src = script[1];

    
    let script_element = document.createElement('script');
    script_element.setAttribute('type', type);
    script_element.setAttribute('src', `${src}/?time=${Date.now()}`);
    script_element.setAttribute('async', '');
    script_element.onload = (e) => {
      load_count++;
    }

    document.head.appendChild(script_element);

  }

  return new Promise(async (resolve, reject) => {
    const checkLoadCount = () => {
      if (load_count == scripts.length) {
        resolve();
      } else {
        setTimeout(checkLoadCount, 50);
      }
    }
    
    checkLoadCount();
  });
}