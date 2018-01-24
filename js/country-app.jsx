'use strict';

/* Patrik Lamberger
 * 2017
 */
/*============================ AppInfo ===================================*/
class AppInfo extends React.Component  {
  render() {
    return (
      <div className={ this.props.infoClass }>
        <hr />
          <h3>{ this.props.titleName }</h3>
          <p>{ this.props.textInfoApp }</p>
        <hr />
          <p><em>{this.props.authorName }</em></p>
        <hr />
      </div>
    )
  }
}
/*============================ CountryApp ===================================*/
class CountryApp extends React.Component {
  constructor() {
    super();
    this.state = {
      header: '',
      countryCollection: [],
      infoClass: 'app-info',
      appName: 'World Map - 2017',
      appInfo:'REACT JS, REST Countries och Google Maps API.',
      author: '- Patrik Lamberger'
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleCord = this.handleCord.bind(this);
  }
  componentDidMount() {
    this.loadCInfo();
  }
  handleSelect(selectedValue) {
    this.setState({ header: selectedValue, infoClass:'app-info-hide' ,appName:'', appInfo:'', author:'' });
  }
  handleCord(a, b) {
    this.setState({ lat: a, lng: b })
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <h3>Vilket land vill du veta mer om?</h3>
            <CountrySelect
              onSelectChange={this.handleSelect}
              countryCollection={this.state.countryCollection} />
            <CountryInfo
              header={this.state.header}
              cordi={this.handleCord} />
            <AppInfo
              infoClass={this.state.infoClass}
              titleName={this.state.appName}
              textInfoApp={this.state.appInfo}
              authorName={this.state.author} />
          </div>
          <div className="col-md-9">

            <CountryMap
              co={this.state.header}
              initialZoom={5}
              mapLat={this.state.lat}
              mapLng={this.state.lng} />
          </div>
        </div>
      </div>
    );
  }
  loadCInfo() {
    var countries = new XMLHttpRequest();
    countries.open('GET', 'https://restcountries.eu/rest/v1/all', true);
    countries.onload = function () {
      if (countries.status === 200) {
        var result = JSON.parse(countries.responseText);
        var ce = [{ name: 'Välj ett land i listan' }];
        var c1c = ce.concat(result);
        this.setState({ countryCollection: c1c });
      }
      else {
        alert('Request failed.  Returned status of ' + countries.status);
      }
    }.bind(this);
    countries.send();
  }
}

/*============================ CountryInfo ==================================*/
class CountryInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { countryInfo: [] };
  }
  componentDidUpdate(props, prevState) {
    if (props.header !== this.props.header) {
      this.loadCountryInfo(this.props.header);
    }
  }

  render() {

    var infoAboutThisCountry = this.state.countryInfo.map(info => {
      return (
        <ul className="list-group">
          <li className="list-group-item">Lokalt namn: {info.nativeName} ( {info.alpha3Code} )</li>
          <li className="list-group-item"><i className="fa fa-university" aria-hidden="true"></i> Huvudstad: {info.capital}</li>
          <li className="list-group-item"><i className="fa fa-globe" aria-hidden="true"></i> Region: {info.region} | {info.subregion}</li>
          <li className="list-group-item"><i className="fa fa-child"></i> Befolkningsmängd: {info.population.toLocaleString()}</li>
          <li className="list-group-item"><i className="fa fa-arrows-alt"></i> Yta: {info.area} km<sup>2</sup></li>
          <li className="list-group-item"><i className="fa fa-money"></i> Valuta: {info.currencies.join(", ")}</li>
          <li className="list-group-item"><i className="fa fa-location-arrow" aria-hidden="true"></i> Latitud: {info.latlng[0]}</li>
          <li className="list-group-item"><i className="fa fa-location-arrow" aria-hidden="true"></i> Longitud: {info.latlng[1]}</li>
          <li className="list-group-item"><i className="fa fa-clock-o" aria-hidden="true"></i> Tidszon: {info.timezones.join(", ")}</li>
          <li className="list-group-item"><i className="fa fa-clock-o" aria-hidden="true"></i> Angränsande länder: {info.borders.join(", ")}</li>
        </ul>

      )

    });
    return (
      <div>
        <h2>{this.props.header}</h2>
        <div>{infoAboutThisCountry}</div>
      </div>
    );
  }
  loadCountryInfo(request) {
    var countryInfo = new XMLHttpRequest();
    countryInfo.open('GET', 'https://restcountries.eu/rest/v1/name/' + request, true);
    countryInfo.onload = function () {
      if (countryInfo.status === 200) {
        var result = JSON.parse(countryInfo.responseText);
        this.setState({ countryInfo: result });
        //console.log(result[0].latlng[0], result[0].latlng[1] );
        this.props.cordi(result[0].latlng[0], result[0].latlng[1]);
      }
      else {
        alert('Request failed.  Returned status of ' + countryInfo.status);
      }
    }.bind(this);
    countryInfo.send();
  }
}
/*============================ CountrySelect ================================*/
class CountrySelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { countryValue: '' };
    this.handleChange = this.handelChange.bind(this);
  }

  handelChange(e) {
    this.setState({ countryValue: e.target.value });
    this.props.onSelectChange(e.target.value);
  }

  render() {
    var countries = this.props.countryCollection.map(country => {
      return (
        <option
          value={country.name}
          key={country.alpha3Code}>
          {country.name}
        </option>
      )
    });
    return (
      <div className="form-group">
        <select
          value={this.state.countryValue}
          onChange={this.handleChange}
          className="form-control">
          {countries}
        </select>
      </div>
    )
  }
}
/*============================ CountryMap ===================================*/
class CountryMap extends React.Component {

  componentDidUpdate(props, prevState) {
    if (props.mapLat !== this.props.mapLat) {
      this.loadCountryMap();
    }
  }
  loadCountryMap() {
    var mapOptions = {
      center: this.mapCenterLatLng(),
      zoom: this.props.initialZoom
    };
    var map = new google.maps.Map(this.refs.mapCountry, mapOptions);
    var marker = new google.maps.Marker({
      position: this.mapCenterLatLng(),
      title: this.props.co, map: map
    });
    this.setState({ map: map });

    var contentString = '<h3>' + this.props.co + '</h3><h5>Latitud ' + this.props.mapLat + ' Longitud ' + this.props.mapLng + '</h5>';
    console.log(this.props);
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    marker.addListener('click', function () {
      infowindow.open(map, marker);
    });
  }
  mapCenterLatLng() {
    var props = this.props;
    return new google.maps.LatLng(props.mapLat, props.mapLng);
  }
  render() {
    return (
      <div className='mapCountry' ref='mapCountry'></div>
    );
  }
}

ReactDOM.render(<CountryApp />, document.getElementById('root'));
