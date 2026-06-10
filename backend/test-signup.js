async function test() {
  const domain = 'dev-khvop4d61s5ip8d3.us.auth0.com';
  const clientId = '3kp2ZDHZYjBxcJaqtGXZdTIShBsK3sJK';
  const email = 'test.signup.athlete@testgym.pe';
  const password = 'Hercix2026!';

  try {
    const res = await fetch(`https://${domain}/dbconnections/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        email: email,
        password: password,
        connection: 'Username-Password-Authentication',
        user_metadata: {
          name: 'Test Signup Athlete'
        }
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('DATA:', data);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
