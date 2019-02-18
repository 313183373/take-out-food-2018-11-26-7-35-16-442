function inputDecode(selectedItems) {
  const allItems = loadAllItems();
  const SEPARATOR = ' x ';
  return selectedItems.map(item => {
    const [id, count] = item.split(SEPARATOR);
    const target = allItems.find(i => i.id === id);
    return {
      ...target,
      count: +count,
      total: target.price * count,
    }
  })
}

function choosePromotion(orderedItems, promotions) {
  const nullPromotion = {type: null, moneySaved: 0};
  return promotions.map(promotion => {
    switch (promotion.type) {
      case "满30减6元": {
        const total = orderedItems.reduce((pre, item) => pre + item.total, 0);
        return total >= 30 ? {
          type: promotion.type,
          moneySaved: 6,
        } : nullPromotion;
      }
      case "指定菜品半价": {
        const moneySaved = orderedItems.reduce((pre, item) => {
          return pre + (promotion.items.includes(item.id) ? item.total / 2 : 0);
        }, 0);
        const names = orderedItems.filter(item => promotion.items.includes(item.id)).map(item => item.name).join('，');
        return moneySaved > 0 ? {
          type: `${promotion.type}(${names})`,
          moneySaved,
        } : nullPromotion;
      }
    }
  }).reduce((pre, promotion) => pre.moneySaved < promotion.moneySaved ? promotion : pre);
}

function buildOrder(orderedItems) {
  const promotion = choosePromotion(orderedItems, loadPromotions());
  return {
    itemList: orderedItems.map(orderedItem => ({
      name: orderedItem.name,
      count: orderedItem.count,
      price: orderedItem.total,
    })),
    promotion,
    total: orderedItems.reduce((pre, orderedItem) => pre + orderedItem.total, 0) - (promotion.type ? promotion.moneySaved : 0),
  }
}

function printOrder({itemList, promotion, total}) {
  const itemsString = itemList.map(item => `${item.name} x ${item.count} = ${item.price}元`).join('\n');
  const promotionString = promotion.type ? `${promotion.type}，省${promotion.moneySaved}元` : '';
  return '============= 订餐明细 =============\n' + itemsString + '\n-----------------------------------\n' + (promotionString ? `使用优惠:\n${promotionString}\n-----------------------------------\n` : '') + `总计：${total}元\n` + "===================================";
}

function bestCharge(selectedItems) {
  const orderedItem = inputDecode(selectedItems);
  const order = buildOrder(orderedItem);
  return printOrder(order);
}
