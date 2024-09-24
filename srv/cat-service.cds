using my.employeeslist as my from '../db/schema';

service CatalogService {
    @Odata.draft.enabled
    entity Employees as projection on my.Employees;
}
