var path = window.location.pathname;
var host = window.location.hostname;



$(document).ready(function () {

	// Material Select Initialization
	$('.mdb-select').material_select();

	// Sidenav Initialization
	$(".button-collapse").sideNav();

});



$(function () {
	// Hashchange
	$(window).hashchange(function () {
		var hash = $.param.fragment(); //mengambil hash dari browser
		if (hash == "tambah") {
			if (path.search('admin/artikel/kategori') > 0) {
				var kategori_artikel = getJSON('http://' + host + path + '/ambil', {});
				$('#category_parent option').remove();
				$('#category_parent').append('<option selected value="0">Sebagai Induk kategori</option>');
				if (kategori_artikel.record) {
					$.each(kategori_artikel.record, function (key, value) {
						$('#category_parent').append('<option value="' + value['category_ID'] + '">' + value['category_name'] + '</option>');
					});
				}
				$('#elegantModalForm .modal-body #post_title').val('');
				$('#elegantModalForm .modal-header #myModalLabel').text('Tambah Kategori Artikel');
				$('#elegantModalForm #submit-kategori-artikel').text('Tambah');
				$('#elegantModalForm #form-artikel').attr('action', 'tambah');

			} else if (path.search('admin/artikel') > 0) {
				// ATRIBUT KATEGORI ARTIKEL
				var kategori_artikel = getJSON('http://' + host + path + '/kategori/ambil', {});
				var post_category = artikel_detail.data['post_category'].split(',');
				var tree = unflatten(kategori_artikel.record);
				var htmlStr = "";
				var printTree = function (node) {
					htmlStr = htmlStr + '<ul class="list-group check-list-group-kategori hirarki kategori">'

					for (var i = 0; i < node.length; i++) {
						htmlStr = htmlStr + '<li class="list-group-item"><input class="form-check-input" type="checkbox" id="checkbox" name="category_slug[] value="' + node[i]['category_slug'] + '">< label class="form-check-label" for= "checkbox" class= "mr-2 label-table" >' + node[i]['category_name'] + '</label >';
						if (node[i]['children']) {
							printTree(node[i]['children'])
						}
						htmlStr = htmlStr + '<li>';
					}
					htmlStr = htmlStr + '</ul>';
					return htmlStr;
				}
				$('div.tab-content div#tab-kategori').html(printTree(tree));

				for (var i in post_category) {
					alert(post_category[i]);
					// $('ul.check-list-group-kategori .li.list-group-item input[type=checkbox][value=' + post_category[i] + ']').prop('checked', true);
				}
				// END ATRIBUT KATEGORI ARTIKEL

				$('#elegantModalForm .modal-body #post_title').val('');

				$('#elegantModalForm .modal-header #myModalLabel').text('Tambah Artikel');
				$('#elegantModalForm #submit-artikel').text('Tambah');
				$('#elegantModalForm #form-artikel').attr('action', 'tambah');
			}
			$('#elegantModalForm').modal('show');

		} else if (hash.search('edit') == 0) {
			if (path.search('admin/artikel/kategori') > 0) {
				$('#elegantModalForm .modal-header #myModalLabel').text('Edit Kategori Artikel');
				$('#elegantModalForm #submit-artikel').text('Edit');
				$('#elegantModalForm #form-artikel').attr('action', 'edit');
			} else if (path.search('admin/artikel') > 0) {
				var post_ID = getUrlVars()['id'];
				var artikel_detail = getJSON('http://' + host + path + '/action/ambil', {
					id: post_ID
				});
				//value data
				$('#elegantModalForm .modal-body #post_title').val('' + artikel_detail.data['post_title']);
				$('#elegantModalForm .modal-body #post_content').val('' + artikel_detail.data['post_content']);
				//opsional modal
				$('#elegantModalForm .modal-header #myModalLabel').text('Edit Artikel');
				$('#elegantModalForm #submit-artikel').text('Edit');
				$('#elegantModalForm #form-artikel').attr('action', 'edit');
				//trigger
				$('#elegantModalForm #form-artikel #post_id').val(post_ID);
			}
			$('#elegantModalForm').modal('show');

		} else if (hash.search("hapus") == 0) {
			if (path.search('admin/artikel/kategori') > 0) {
				var category_ID = getUrlVars()['id'];
				var category_detail = getJSON('http://' + host + path + '/ambil', {
					id: category_ID
				});
				$('#elegantModalForm form').hide();
				$('#elegantModalForm #form-kategori-artikel').attr('action', 'hapus');
				$('#elegantModalForm #myModalLabel').text('Hapus kategori artikel');
				$('#elegantModalForm #submit-kategori-artikel').text('Hapus saja');
				$('#elegantModalForm .modal-body').prepend('<p id="hapus-notif">Apakah Anda yakin akan menghapus : Kategori  <b>' + category_detail.data['category_name'] + '</b> ???</p>');
				$('#elegantModalForm #form-kategori-artikel #category_id').val(category_ID);
			} else if (path.search('admin/artikel') > 0) {
				var post_ID = getUrlVars()['id'];
				var artikel_detail = getJSON('http://' + host + path + '/action/ambil', {
					id: post_ID
				});
				$('#elegantModalForm form').hide();
				$('#elegantModalForm #myModalLabel').text('Hapus artikel');
				$('#elegantModalForm #submit-artikel').text('Hapus saja');
				$('#elegantModalForm #form-artikel').attr('action', 'hapus');
				$('#elegantModalForm .modal-body').prepend('<p id="hapus-notif">Apakah Anda yakin akan menghapus : Artikel  <b>' + artikel_detail.data['post_title'] + '</b> ???</p>');
				$('#elegantModalForm #form-artikel #post_id').val(post_ID);
			}
			$('#elegantModalForm').modal('show');
		} else if (hash.search("ambil") == 0) {
			if (path.search('admin/artikel')) {
				var hal_aktif, cari, kategori = null;
				var hash = getUrlVars();
				if (hash['hal']) {
					hal_aktif = hash['hal'];
				}

				ambil_artikel(hal_aktif, true);
				$('ul#pagination-artikel li a:contains(' + hal_aktif + ')').parents().addClass('active').siblings().removeClass('active');
			}
		}

	});
	$(window).trigger('hashchange'); //memanggil ulang hash ketika browser di reload

	$('#elegantModalForm').on('hidden.bs.modal', function () {
		window.history.pushState(null, null, path);
		$('#elegantModalForm').removeClass('modal-lg');
		$('#elegantModalForm form').find("input[type=text], textarea").val(null);
		$('#elegantModalForm #hapus-notif').remove();
		$('#elegantModalForm form').show();
	});

	moment.locale('id');

	/* ************************************** */
	/*        BACKEND BAGIAN ARTIKEL          */
	/* ************************************** */

	$(document).on('click', '#submit-artikel', function (e) {
		e.preventDefault(); //menjalankan preintah javascript tanpa reload atau menjalankan link

		var action = $('#form-artikel').attr('action');
		var datatosend = $('#form-artikel').serialize();

		$.ajax('http://' + host + path + '/action/' + action, {
			dataType: 'json',
			type: 'POST',
			data: datatosend,
			success: function (data) {
				if (data.status == "success") {
					ambil_artikel(null, false);
					$('#elegantModalForm').modal('hide');
					if (data.tipe == "insert") {
						toastr.success('Sukses! Anda telah MENULIS artikel');
					} else if (data.tipe == "edit") {
						toastr.success('Sukses! Anda telah MENGUBAH artikel');
					} else if (data.tipe == "delete") {
						toastr.success('Sukses! Anda telah MENGHAPUS artikel');
					}
				} else {
					$.each(data.errors, function (key, value) {
						$('#' + key).attr('placeholder', value);
					});
				}
			}
		});
		//end ajax
	});


	// *************************
	if (getUrlVars()['hal']) {
		ambil_artikel(getUrlVars()['hal'], false)
	} else {
		ambil_artikel(null, false);
	}

	/* ************************************** */
	/*       BACKEND BAGIAN KATEGORI          */
	/* ************************************** */
	$(document).on('click', '#submit-kategori-artikel', function (eve) {
		eve.preventDefault();
		var action = $('#form-kategori-artikel').attr('action');
		$.ajax('http://' + host + path + '/' + action, {
			dataType: 'JSON',
			type: 'POST',
			data: $('#form-kategori-artikel').serialize(),
			success: function (data) {
				if (data.status == 'success') {
					ambil_kategori();
					$('#elegantModalForm').modal('hide');
					if (data.tipe == "insert") {
						toastr.success('Sukses! Anda telah MENAMBAH kategori');
					} else if (data.tipe == "edit") {
						toastr.success('Sukses! Anda telah MENGUBAH kategori');
					} else if (data.tipe == "delete") {
						toastr.success('Sukses! Anda telah MENGHAPUS kategori');
					}
				} else {
					$.each(data.errors, function (key, value) {
						$('#' + key).attr('placeholder', value);
					});
				}
			}
		});
	});

	// ************* AMBIL KATEGORI (READ)
	ambil_kategori();
});




/* ************************************** */
/*       ANEKA JAVASCRIPT FUNCTION        */
/* ************************************** */

function ambil_artikel(hal_aktif, scrolltop) {
	if ($('table#tbl_artikel').length > 0) {
		$.ajax('http://' + host + path + '/action/ambil', {
			dataType: 'JSON',
			type: 'POST',
			data: {
				hal_aktif: hal_aktif
			},
			success: function (data) {
				$('table#tbl_artikel tbody tr').remove();
				$.each(data.record, function (index, element) {
					$('table#tbl_artikel').find('tbody').append(
						'<tr>' +
						'<td width="2%"><input class="form-check-input" name="post_id[]" type="checkbox" id="checkbox' + element.post_ID + '" value="' + element.post_ID + '" id="checkbox1">' +
						'<label class = "form-check-label" for = "checkbox' + element.post_ID + '" class = "mr-2 label-table"></label ></td > ' +
						'<td width="50%"><a href="artikel#edit?id=' + element.post_ID + '">' + element.post_title + '<a></td>' +
						'<td width="10%"><i class="far fa-comment-dots mx-1"></i> ' + element.comment_count + '</td>' +
						'<td width="10%"><i class="far fa-eye mx-1"></i> ' + element.post_counter + ' </td>' +
						'<td width="12%"><i class="far fa-clock mr-1"></i> ' + moment(element.post_date).fromNow() + '</td>' +
						'<td width="16%">' +
						'<a href="artikel#hapus?id=' + element.post_ID + '">' +
						'<button class="btn btn-sm peach-gradient mr-1" data-toggle="modal" data-target="#elegantModalForm"><i class="fas fa-trash"></i></button>' +
						'</a>' +
						'<a href="artikel#edit?id=' + element.post_ID + '">' +
						'<button class="btn btn-sm purple-gradient mr-1" data-toggle="modal" data-target="#elegantModalForm"><i class="fas fa-pencil-alt"></i></button>' +
						'</a>' +
						'</td>' +
						'</tr>'
					);
				});

				// BGIAN UNTUK PAGINATION
				var pagination = '';
				var paging = Math.ceil(data.total_rows / data.perpage);

				if ((!hal_aktif) && ($('ul#pagination-artikel li').length == 0)) {
					$('ul#pagination-artikel li').remove();
					for (i = 1; i <= paging; i++) {
						pagination = pagination + '<li class="page-item clearfix d-none d-md-inline-block"><a href="artikel#ambil?hal=' + i + '" class="page-link">' + i + '</a></li>'
					}
				} else if (hal_aktif) {
					$('ul#pagination-artikel li').remove();
					for (i = 1; i <= paging; i++) {
						pagination = pagination + '<li class="page-item clearfix d-none d-md-inline-block"><a href="artikel#ambil?hal=' + i + '" class="page-link">' + i + '</a></li>'
					}
				}

				$('ul#pagination-artikel').append(pagination);
				$("ul#pagination-artikel li:contains(" + hal_aktif + ")").addClass('active');
				if (scrolltop == true) {
					$('body').scrollTop(0);
				}
			}
		});
	}
}

function ambil_kategori() {
	// jsfiddle.net/LkkwH/1/
	// http://jsfiddle.net/sw_lasse/9wpHa/
	var path = window.location.pathname;
	var host = window.location.hostname;
	if ($('#list-kategori').length > 0) {
		$.ajax('http://' + host + path + '/ambil', {
			dataType: 'JSON',
			type: 'POST',
			success: function (data) {

				$('#list-kategori ul').remove();

				var htmlStr = "";
				var printTree = function (node) {

					htmlStr = htmlStr + '<ul class="list-group hirarki kategori">';

					for (var i = 0; i < node.length; i++) {
						if (node[i]['children']) var listyle = 'li-parent';
						else listyle = '';
						htmlStr = htmlStr + '<li id="ID_' + node[i]['category_ID'] + '" class="list-group-item ' + listyle + '">';
						htmlStr = htmlStr + '<div class="row justify-content-between">';
						htmlStr = htmlStr + '<div class="col-md-4 pt-2">';
						htmlStr = htmlStr + '<a class="link-edit" href="kategori#edit?id=' + node[i]['category_ID'] + '">' + node[i]['category_name'] + '</a>';
						htmlStr = htmlStr + '</div>';
						htmlStr = htmlStr + '<div class="col-md-4">';
						htmlStr = htmlStr + '<a href="kategori#edit?id=' + node[i]['category_ID'] + '" class="link-edit btn purple-gradient btn-sm"><i class="btn-icon-only icon-pencil"></i> Edit</a> ';
						htmlStr = htmlStr + '<a href="kategori#hapus?id=' + node[i]['category_ID'] + '" id="hapus_" class="btn peach-gradient btn-sm"><i class="btn-icon-only icon-remove"></i> Hapus</a>';
						htmlStr = htmlStr + '</div>'
						htmlStr = htmlStr + '</div>'

						if (node[i]['children']) {
							printTree(node[i]['children'])
						}

						htmlStr = htmlStr + '</li>';
					}

					htmlStr = htmlStr + '</ul>';
					return htmlStr;
				}

				tree = unflatten(data.record);

				$('#list-kategori').html(printTree(tree));



				$('#list-kategori .list-group').sortable({
					opacity: 0.5,
					cursor: 'move',
					placeholder: 'ui-state-highlight',
					update: function () {
						var orderAll = [];
						$('.list-group li').each(function () {
							orderAll.push($(this).attr('id').replace(/_/g, '[]='));
						});

						// alert($(this).sortable('serialize'));
						// exit;
						$.post('http://' + host + path + '/sortir', orderAll.join('&'));
					}
				});
			}
		});
	}
}


function unflatten(array, parent, tree) {
	tree = typeof tree !== 'undefined' ? tree : [];
	parent = typeof parent !== 'undefined' ? parent : {
		category_ID: 0
	};

	var children = _.filter(array, function (child) {
		return child.category_parent == parent.category_ID;
	});

	if (!_.isEmpty(children)) {
		if (parent.category_ID == 0) {
			tree = children;
		} else {
			parent['children'] = children;
		}
		_.each(children, function (child) {
			unflatten(array, child)
		});
	}

	return tree;
}

function getUrlVars() {
	var vars = [],
		hash;
	var hashesh = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashesh.length; i++) {
		// window.location.href untuk menggambil value dari url get
		// slice(window.location.href.indexOf('?')) untuk memisahkan index menurut string ?
		// split('&'); memisahkan value yang diambil berdasarkan string & dan mengembalikannya sebagai index array
		// final = mengambil index value get dari url 

		hash = hashesh[i].split('=');

		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function getJSON(url, data) {
	return JSON.parse(
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			dataType: 'JSON',
			global: false,
			async: false,
			success: function (msg) {

			}
		}).responseText
	);
}

function createEditor() {
	InlineEditor
		.create(document.querySelector('#editor'), {
			// toolbar: ['heading', '|', 'bold', 'italic', 'link']
		})
		.then(editor => {
			window.editor = editor;
		})
		.catch(err => {
			console.error(err.stack);
		});
}
