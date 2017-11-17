<template>
    <div id="app">
        <h1>Customers Grid</h1>
        <div class="ui segment" :class="{loading: isLoading}">
            <div class="ui form">
                <div class="field">
                    <label>First Name</label>
                    <input v-model="firstName">
                </div>
                <div class="field">
                    <label>Last Name</label>
                    <input v-model="lastName">
                </div>
            </div>
            <div class="ui hidden divider"></div>
            <button class="ui large green inverted button" @click="submit">Submit</button>
            <div class="ui hidden divider"></div>
            <table class="ui basic table" v-if="customers.length">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Created Time</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="customer in customers">
                    <td>{{customer.id}}</td>
                    <td>{{customer.primaryAddress.firstName}}</td>
                    <td>{{customer.primaryAddress.lastName}}</td>
                    <td>{{customer.createdTime}}</td>
                </tr>
                </tbody>
            </table>
            <div v-else>
                No customers
            </div>
            <div class="ui hidden divider"></div>
            <div class="ui hidden divider"></div>
        </div>
    </div>
</template>

<script>
    import RebillyAPI from 'rebilly-js-sdk';

    const ws = new WebSocket('ws://localhost:9090');

    export default {
        name: 'app',
        data() {
            return {
                sandboxAPI: RebillyAPI({sandbox: true}),
                customers: [],
                firstName: '',
                lastName: '',
                isLoading: true
            }
        },
        methods: {
            async submit() {
                this.isLoading = true;
                const params = {
                    primaryAddress: {
                        firstName: this.firstName,
                        lastName: this.lastName
                    }
                };
                try {
                    const response = await this.sandboxAPI.customers.create({id: '', data: params});
                    ws.send(JSON.stringify(response.fields));
                }
                catch(error) {
                    console.warn(error);
                }
                finally {
                    this.isLoading = false;
                }
            },
            addToCustomers(data) {
                this.customers.unshift(JSON.parse(data));
            },
            async loginAndGetCustomers() {
                const params = {
                    email: 'user@rebilly.com',
                    password: 'asdfasdf1'
                };
                try {
                    this.sandboxAPI.setEndpoints({sandbox: 'http://api-sandbox.dev-local.rebilly.com'});
                    if (!window.localStorage.getItem('token')) {
                        const loginResponse = await this.sandboxAPI.account.signIn({data: params});
                        window.localStorage.setItem('token', loginResponse.fields.token);
                    }
                    this.sandboxAPI.setSessionToken(window.localStorage.getItem('token'));
                    const response = await this.sandboxAPI.customers.getAll({limit: 1000, sort: '-createdTime'});
                    this.customers = response.items.map(item => item.fields);
                }
                catch (error) {
                    console.warn(error);
                }
                finally {
                    this.firstName = '';
                    this.lastName = '';
                    this.isLoading = false;
                }
            }
        },
        mounted() {
            this.loginAndGetCustomers();
            ws.onopen = () => {
                console.warn('connection opened');
            };
            ws.onmessage = (evt) => {
                console.warn('message received');
                this.addToCustomers(evt.data);
            };
        }
    }
</script>

<style>
    #app {
        color: #2c3e50;
        margin-top: 60px;
        margin-left: 60px;
    }
    .segment {
        width: 800px;
    }
</style>
