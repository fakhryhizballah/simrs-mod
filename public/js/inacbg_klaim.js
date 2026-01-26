let btnCari = document.getElementById('cari')
btnCari.addEventListener("click", functionCari);
function getCookieValue(name) {
    let value = document.cookie.split(';').filter(item => item.trim().startsWith(name + '='))[0];
    if (value) {
        value = decodeURIComponent(value.split('=')[1]);
    } else {
        value = null;
    }
    return value;
}

let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let username = getCookieValue('decoded');
sessionStorage.setItem('coder', username);


console.log(API_URL)
async function functionCari() {
    console.log("cari")
    let keyword = document.getElementById('keyword').value;
    let tanggalawal = document.getElementById('tanggalawal').value;
    let tanggalakhir = document.getElementById('tanggalakhir').value;
    let statusRanap = document.getElementById('statusRanap').value;
    let cari = await fetch(
        API_URL + "/api/inacbg/byreg?keyword=" + keyword + "&tanggalawal=" + tanggalawal + "&tanggalakhir=" + tanggalakhir + "&status_lanjut=" + statusRanap,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }

        }
    )
    cari = await cari.json();
    console.log(cari)
    const tableBody = document.getElementById('dataklaim');
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Loading...</td></tr>';

    tableBody.innerHTML = '';

    if (!cari.data || cari.data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Data tidak ditemukan</td></tr>';
        return;
    }
    let paginationtop = document.getElementById('paginationtop');
    paginationtop.innerHTML = ''
    let pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    let span1 = document.createElement('span');
    span1.innerText = 'Menampilkan ' + cari.data.length + ' data dari filter yang dipilih';
    let span2 = document.createElement('span');
    span2.innerText = 'Menampilkan ' + cari.data.length + ' data dari filter yang dipilih';
    paginationtop.appendChild(span1);
    pagination.appendChild(span2);
    for (let x of cari.data){
        console.log(x)
        let dataSep = '-'
        if (x.bridging_sep != null) {
            dataSep = x.bridging_sep.no_sep
        }else{
                x.bridging_sep = {
                    no_sep: '-'
                }
        }
        let diagnosa = ''
        let prosedur = ''
        for (let y of x.diagnosa_pasien) {
            console.log(y.kd_penyakit)
            diagnosa += y.kd_penyakit + '#'
        }
        console.log(diagnosa)
        for (let y of x.prosedur_pasien) {
            prosedur += y.kode + '#'
        }
        let tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-50', 'transition-colors');

        let td1 = document.createElement('td');
        td1.classList.add('px-4', 'py-4', 'whitespace-nowrap');
        let div1 = document.createElement('div');
        div1.classList.add('text-sm', 'font-medium', 'text-blue-600');
        div1.innerText = x.no_rawat;
        let div2 = document.createElement('div');
        div2.classList.add('text-xs', 'text-gray-500');
        div2.innerText = 'SEP: ' + dataSep;
        let divlanjut = document.createElement('div');
        divlanjut.classList.add('text-xs', 'text-gray-500');
        divlanjut.innerText = 'Stt: ' + x.status_lanjut;
        td1.appendChild(div1);
        td1.appendChild(div2);
        td1.appendChild(divlanjut);

        let td2 = document.createElement('td');
        td2.classList.add('px-4', 'py-4');
        let div3 = document.createElement('div');
        div3.classList.add('text-sm', 'font-bold', 'text-gray-900');
        div3.innerText = x.pasien.nm_pasien;
        let div4 = document.createElement('div');
        div4.classList.add('text-xs', 'text-gray-500');
        div4.innerText = 'RM: ' + x.no_rkm_medis + ' | ' + x.pasien.umur;
        let div5 = document.createElement('div');
        div5.classList.add('text-xs', 'text-gray-400', 'italic');
        div5.innerText = 'PJ: ' + x.p_jawab;
        td2.appendChild(div3);
        td2.appendChild(div4);
        td2.appendChild(div5);

        let td3 = document.createElement('td');
        td3.classList.add('px-4', 'py-4', 'whitespace-nowrap');
        let div6 = document.createElement('div');
        div6.classList.add('text-sm', 'text-gray-600');
        div6.innerText = x.tgl_registrasi;
        let div7 = document.createElement('div');
        div7.classList.add('text-xs', 'text-gray-400');
        div7.innerText = x.jam_reg;
        td3.appendChild(div6);
        td3.appendChild(div7);

        let td4 = document.createElement('td');
        td4.classList.add('px-4', 'py-4');
        let div8 = document.createElement('div');
        div8.classList.add('text-sm', 'font-semibold', 'text-gray-700');
        div8.innerText = x.poliklinik.nm_poli;
        let div9 = document.createElement('div');
        div9.classList.add('text-xs', 'text-gray-500');
        div9.innerText = x.dokter.nm_dokter;
        td4.appendChild(div8);
        td4.appendChild(div9);

        let td5 = document.createElement('td');
        td5.classList.add('px-4', 'py-4', 'whitespace-nowrap');
        let span1 = document.createElement('span');
        span1.classList.add('px-2', 'py-1', 'text-xs', 'font-semibold', 'rounded-full', 'bg-blue-100', 'text-blue-800');
        span1.innerText = x.penjab.png_jawab;
        td5.appendChild(span1);

        let td6 = document.createElement('td');
        td6.classList.add('px-4', 'py-4');
        let div10 = document.createElement('div');
       
        for (let y of x.diagnosa_pasien) {
            console.log(y.kd_penyakit)
            div10.classList.add('flex', 'flex-wrap', 'gap-1', 'mb-1');
            let span2 = document.createElement('span');
            span2.classList.add('bg-red-50', 'text-red-600', 'text-[10px]', 'px-1.5', 'py-0.5', 'border', 'border-red-200', 'rounded');
            span2.innerText = y.kd_penyakit;
            div10.appendChild(span2);
        }
        let div11 = document.createElement('div');
        for (let y of x.prosedur_pasien) {
            console.log(y.kode)
            div10.classList.add('flex', 'flex-wrap', 'gap-1', 'mb-1');
            let span2 = document.createElement('span');
            span2.classList.add('bg-blue-50', 'text-blue-600', 'text-[10px]', 'px-1.5', 'py-0.5', 'border', 'border-blue-200', 'rounded');
            span2.innerText = y.kode;
            div10.appendChild(span2);
        }
        td6.appendChild(div10);
        td6.appendChild(div11);

        let td7 = document.createElement('td');
        td7.classList.add('px-4', 'py-4', 'whitespace-nowrap');
        if (x.status_bayar == 'Sudah Bayar') {
            let span3 = document.createElement('span');
            span3.classList.add('px-2', 'py-1', 'text-xs', 'font-bold', 'rounded', 'bg-green-100', 'text-green-700', 'uppercase');
            span3.innerText = x.status_bayar;
            td7.appendChild(span3);
        } else {
            let span4 = document.createElement('span');
            span4.classList.add('px-2', 'py-1', 'text-xs', 'font-bold', 'rounded', 'bg-yellow-100', 'text-yellow-700', 'uppercase');
            span4.innerText = x.status_bayar;
            td7.appendChild(span4);
        }
   

        let td8 = document.createElement('td');
        td8.classList.add('px-4', 'py-4');
        let button = document.createElement('button');
        button.classList.add('w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
        button.innerText = 'Klaim';
        button.addEventListener('click', function() {
            kirmData(x)
        })
        td8.appendChild(button);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
        tr.appendChild(td8);

        tableBody.appendChild(tr);

    }

    
}
async function kirmData(params) {
    console.log(params)
    sessionStorage.setItem('inacbg_klaim', JSON.stringify(params));
    location.href = '/menu/inacbg_klaim/kirim';
    
}