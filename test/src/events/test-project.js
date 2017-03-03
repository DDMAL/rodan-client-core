describe('Project', function()
{
    before(function(done) { ensureInitializationAndLogin(done); });
    after(ensureDeinitialization);

    // Create and delete project.
    var requests = [rodan.events.REQUEST__PROJECT_CREATE, 
                    rodan.events.REQUEST__PROJECT_DELETE,
                    rodan.events.REQUEST__PROJECT_GET_ACTIVE,
                    rodan.events.REQUEST__PROJECT_SET_ACTIVE,
                    rodan.events.EVENT__PROJECT_SAVED];
    describe(requests.join(', '), function()
    {
        // Create.
        var project = null;
        it(rodan.events.EVENT__PROJECT_CREATED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__PROJECT_CREATED, function(options)
            { 
                project = options.project;
                assert.instanceOf(project, rodan.Project);
                done(); 
            });
            var newProject = new rodan.Project();
            rodan.channel.request(rodan.events.REQUEST__PROJECT_CREATE, {project: project});
        });

        // Get active (none).
        it(rodan.events.REQUEST__PROJECT_GET_ACTIVE, function(done)
        {
            var activeProject = rodan.channel.request(rodan.events.REQUEST__PROJECT_GET_ACTIVE);
            assert.isNotOk(activeProject);
            done(); 
        });

        // Set active.
        it(rodan.events.REQUEST__PROJECT_SET_ACTIVE, function(done)
        {
            rodan.channel.request(rodan.events.REQUEST__PROJECT_SET_ACTIVE, {project: project});
            done(); 
        });

        // Get active (project).
        it(rodan.events.REQUEST__PROJECT_GET_ACTIVE, function(done)
        {
            var activeProject = rodan.channel.request(rodan.events.REQUEST__PROJECT_GET_ACTIVE);
            assert.deepEqual(activeProject, project);
            done(); 
        });

        // Update and save.
        it(rodan.events.EVENT__PROJECT_SAVED, function(done)
        {
            var newName = 'newname_' + createRandomId().toString();
            rodan.channel.once(rodan.events.EVENT__PROJECT_SAVED, function(options)
            { 
                project = options.project;
                assert.equal(project.get('name'), newName);
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__PROJECT_SAVE, {project: project, fields: {name: newName}});
        });

        // User tasks.
        it('Project user tasks');

        // Delete.
        it(rodan.events.EVENT__PROJECT_DELETED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__PROJECT_DELETED, function(options)
            { 
                assert.instanceOf(project, rodan.Project);
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__PROJECT_DELETE, {project: project});
        });
    });
});