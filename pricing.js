function calculateFare(distanceKm, hasCoupon = false) {
  const distance = Math.max(1, Number(distanceKm) || 1);

  let customerFare;
  let riderPay;

  if (distance <= 3) {
    customerFare = 55;
    riderPay = 40;
  } else {
    customerFare = distance * 15 + 10;
    riderPay = distance * 12;
  }

  const discount = hasCoupon ? customerFare * 0.10 : 0;
  const finalFare = customerFare - discount;
  const companyAmount = finalFare - riderPay;

  return {
    distanceKm: distance,
    customerFare: finalFare,
    riderPay,
    companyAmount,
    discount
  };
}
