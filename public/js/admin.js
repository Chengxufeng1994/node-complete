async function handleDeleteProduct(btn) {
  console.log('[handle Delete Product]', btn);
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  const _csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');
  const url = '/admin/product/' + productId;

  await fetch(url, {
    headers: {
      'Content-type': 'application/json; charset=UTF-8', // Indicates the content
      'csrf-token': _csrf,
    },
    method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
}
